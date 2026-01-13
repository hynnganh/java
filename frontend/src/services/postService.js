import axios from 'axios';

const postService = {
  getExternalPosts: async () => {
    try {
      // Sử dụng RSS chuyên mục Làm đẹp/Sức khỏe
      // Bạn có thể thay đổi URL RSS tùy thích
      const RSS_URL = "https://vnexpress.net/rss/suc-khoe.rss"; 
      const API_CONVERTER = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
      
      const response = await axios.get(API_CONVERTER);
      
      if (response.data.status === 'ok') {
        // Lọc các bài viết có từ khóa liên quan đến da, mỹ phẩm, làm đẹp
        const keywords = ['da', 'mỹ phẩm', 'skincare', 'làm đẹp', 'trắng', 'mụn', 'serum', 'kem'];
        
        return response.data.items
          .filter(item => 
            keywords.some(key => item.title.toLowerCase().includes(key) || item.description.toLowerCase().includes(key))
          )
          .map(item => ({
            id: item.guid,
            title: item.title,
            date: new Date(item.pubDate).toLocaleDateString('vi-VN'),
            img: item.thumbnail || item.enclosure.link || "https://picsum.photos/400/250?skincare",
            desc: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
            link: item.link
          }));
      }
      return [];
    } catch (error) {
      console.error("Lỗi lấy tin tức làm đẹp:", error);
      return [];
    }
  }
};

export default postService;