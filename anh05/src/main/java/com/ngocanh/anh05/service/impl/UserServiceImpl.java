// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package com.ngocanh.anh05.service.impl;

import com.ngocanh.anh05.config.AppConstants;
import com.ngocanh.anh05.entity.Address;
import com.ngocanh.anh05.entity.Cart;
import com.ngocanh.anh05.entity.CartItem;
import com.ngocanh.anh05.entity.Role;
import com.ngocanh.anh05.entity.User;
import com.ngocanh.anh05.exceptions.APIException;
import com.ngocanh.anh05.exceptions.ResourceNotFoundException;
import com.ngocanh.anh05.payloads.AddressDTO;
import com.ngocanh.anh05.payloads.CartDTO;
import com.ngocanh.anh05.payloads.ProductDTO;
import com.ngocanh.anh05.payloads.UserDTO;
import com.ngocanh.anh05.payloads.UserResponse;
import com.ngocanh.anh05.repository.AddressRepo;
import com.ngocanh.anh05.repository.RoleRepo;
import com.ngocanh.anh05.repository.UserRepo;
import com.ngocanh.anh05.service.CartService;
import com.ngocanh.anh05.service.UserService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Transactional
@Service
public class UserServiceImpl implements UserService {
   @Autowired
   private UserRepo userRepo;
   @Autowired
   private RoleRepo roleRepo;
   @Autowired
   private AddressRepo addressRepo;
   @Autowired
   private CartService cartService;
   @Autowired
   private PasswordEncoder passwordEncoder;
   @Autowired
   private ModelMapper modelMapper;

   public UserServiceImpl() {
   }

   public UserDTO registerUser(UserDTO userDTO) {
      try {
         User user = (User)this.modelMapper.map(userDTO, User.class);
         Cart cart = new Cart();
         cart.setUser(user);
         user.setCart(cart);
         Role role = (Role)this.roleRepo.findById(AppConstants.USER_ID).get();
         user.getRoles().add(role);
         String country = userDTO.getAddress().getCountry();
         String state = userDTO.getAddress().getState();
         String city = userDTO.getAddress().getCity();
         String pincode = userDTO.getAddress().getPincode();
         String street = userDTO.getAddress().getStreet();
         String buildingName = userDTO.getAddress().getBuildingName();
         Address address = this.addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(country, state, city, pincode, street, buildingName);
         if (address == null) {
            address = new Address(country, state, city, pincode, street, buildingName);
            address = (Address)this.addressRepo.save(address);
         }

         user.setAddresses(List.of(address));
         User registeredUser = (User)this.userRepo.save(user);
         cart.setUser(registeredUser);
         userDTO = (UserDTO)this.modelMapper.map(registeredUser, UserDTO.class);
         userDTO.setAddress((AddressDTO)this.modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
         return userDTO;
      } catch (DataIntegrityViolationException var13) {
         throw new APIException("User already exists with emailId: " + userDTO.getEmail());
      }
   }

   public UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
      Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(new String[]{sortBy}).ascending() : Sort.by(new String[]{sortBy}).descending();
      Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
      Page<User> pageUsers = this.userRepo.findAll(pageDetails);
      List<User> users = pageUsers.getContent();
      if (users.size() == 0) {
         throw new APIException("No User exists !!!");
      } else {
         List<UserDTO> userDTOs = (List)users.stream().map((user) -> {
            UserDTO dto = (UserDTO)this.modelMapper.map(user, UserDTO.class);
            if (user.getAddresses().size() != 0) {
               dto.setAddress((AddressDTO)this.modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
            }

            CartDTO cart = (CartDTO)this.modelMapper.map(user.getCart(), CartDTO.class);
            List<ProductDTO> products = (List)user.getCart().getCartItems().stream().map((item) -> {
               return (ProductDTO)this.modelMapper.map(item.getProduct(), ProductDTO.class);
            }).collect(Collectors.toList());
            dto.setCart(cart);
            dto.getCart().setProducts(products);
            return dto;
         }).collect(Collectors.toList());
         UserResponse userResponse = new UserResponse();
         userResponse.setContent(userDTOs);
         userResponse.setPageNumber(pageUsers.getNumber());
         userResponse.setPageSize(pageUsers.getSize());
         userResponse.setTotalElements(pageUsers.getTotalElements());
         userResponse.setTotalPages(pageUsers.getTotalPages());
         userResponse.setLastPage(pageUsers.isLast());
         return userResponse;
      }
   }

   public UserDTO getUserById(Long userId) {
      User user = (User)this.userRepo.findById(userId).orElseThrow(() -> {
         return new ResourceNotFoundException("User", "userId", userId);
      });
      UserDTO userDTO = (UserDTO)this.modelMapper.map(user, UserDTO.class);
      userDTO.setAddress((AddressDTO)this.modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
      CartDTO cart = (CartDTO)this.modelMapper.map(user.getCart(), CartDTO.class);
      List<ProductDTO> products = (List)user.getCart().getCartItems().stream().map((item) -> {
         return (ProductDTO)this.modelMapper.map(item.getProduct(), ProductDTO.class);
      }).collect(Collectors.toList());
      userDTO.setCart(cart);
      userDTO.getCart().setProducts(products);
      return userDTO;
   }

   public UserDTO getUserByEmail(String email) {
      User user = (User)this.userRepo.findByEmail(email).orElseThrow(() -> {
         return new ResourceNotFoundException("User", "email", email);
      });
      UserDTO userDTO = (UserDTO)this.modelMapper.map(user, UserDTO.class);
      if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
         userDTO.setAddress((AddressDTO)this.modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
      }

      if (user.getCart() != null) {
         CartDTO cart = (CartDTO)this.modelMapper.map(user.getCart(), CartDTO.class);
         List<ProductDTO> products = (List)user.getCart().getCartItems().stream().map((item) -> {
            return (ProductDTO)this.modelMapper.map(item.getProduct(), ProductDTO.class);
         }).collect(Collectors.toList());
         cart.setProducts(products);
         userDTO.setCart(cart);
      }

      return userDTO;
   }

@Override
public UserDTO updateUser(Long userId, UserDTO userDTO) {

    User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

    // ===== UPDATE USER BASIC INFO =====
    if (userDTO.getFirstName() != null)
        user.setFirstName(userDTO.getFirstName());

    if (userDTO.getLastName() != null)
        user.setLastName(userDTO.getLastName());

    if (userDTO.getMobileNumber() != null)
        user.setMobileNumber(userDTO.getMobileNumber());

    if (userDTO.getEmail() != null)
        user.setEmail(userDTO.getEmail());

    // ===== UPDATE ADDRESS =====
    if (userDTO.getAddress() != null) {
        AddressDTO a = userDTO.getAddress();

        Address address;
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            address = user.getAddresses().get(0);
        } else {
            address = new Address();
        }

        if (a.getCountry() != null) address.setCountry(a.getCountry());
        if (a.getState() != null) address.setState(a.getState());
        if (a.getCity() != null) address.setCity(a.getCity());
        if (a.getPincode() != null) address.setPincode(a.getPincode());
        if (a.getStreet() != null) address.setStreet(a.getStreet());
        if (a.getBuildingName() != null) address.setBuildingName(a.getBuildingName());

        addressRepo.save(address);
        user.setAddresses(List.of(address));
    }

    User updatedUser = userRepo.save(user);

    // ===== MAP TO DTO =====
    UserDTO result = modelMapper.map(updatedUser, UserDTO.class);

    if (!updatedUser.getAddresses().isEmpty()) {
        result.setAddress(
            modelMapper.map(updatedUser.getAddresses().get(0), AddressDTO.class)
        );
    }

    if (updatedUser.getCart() != null) {
        CartDTO cartDTO = modelMapper.map(updatedUser.getCart(), CartDTO.class);

        List<ProductDTO> products = updatedUser.getCart()
                .getCartItems()
                .stream()
                .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                .collect(Collectors.toList());

        cartDTO.setProducts(products);
        result.setCart(cartDTO);
    }

    return result;
}

public UserDTO updateUserRoles(Long userId, Long roleIds) {
      try {
         User user = (User)this.userRepo.findById(userId).orElseThrow(() -> {
            return new ResourceNotFoundException("User", "id", userId);
         });
         user.getRoles().clear();
         Role role;
         if (roleIds == AppConstants.ADMIN_ID) {
            role = (Role)this.roleRepo.findById(AppConstants.ADMIN_ID).get();
            user.getRoles().add(role);
         }

         role = (Role)this.roleRepo.findById(AppConstants.USER_ID).get();
         user.getRoles().add(role);
         User updatedUser = (User)this.userRepo.save(user);
         UserDTO userDTO = (UserDTO)this.modelMapper.map(updatedUser, UserDTO.class);
         return userDTO;
      } catch (Exception var7) {
         throw new APIException("Error updating user roles: " + var7.getMessage());
      }
   }

   public String deleteUser(Long userId) {
      User user = (User)this.userRepo.findById(userId).orElseThrow(() -> {
         return new ResourceNotFoundException("User", "userId", userId);
      });
      List<CartItem> cartItems = user.getCart().getCartItems();
      Long cartId = user.getCart().getCartId();
      cartItems.forEach((item) -> {
         Long productId = item.getProduct().getProductId();
         this.cartService.deleteProductFromCart(cartId, productId);
      });
      this.userRepo.delete(user);
      return "User with userId " + userId + " deleted successfully!!!";
   }
}
