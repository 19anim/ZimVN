# ZIM Video Carousel Demo

Đây là một bản demo section carousel video viết bằng HTML, CSS và JavaScript thuần. Card ở giữa là card chính, các card xung quanh đóng vai trò thumbnail, có hover 3D tilt nhẹ, progress ring khi chờ hover để phát video, và cơ chế chuyển trạng thái rõ ràng giữa thumbnail, active card và video đang phát.

## Chạy dự án

Project này không cần build step. Chỉ cần mở trực tiếp file HTML hoặc chạy bằng một static server là đủ.

Mở trực tiếp:

```bash
open index.html
```

Nếu bạn đang dùng VS Code, có thể mở file `index.html` bằng Live Server để xem nhanh.

Nếu muốn chạy bằng `npm`:

```bash
npx serve .
```

## Ghi chú accessibility

Phần demo này đã có một số xử lý cơ bản cho accessibility:

- Có hỗ trợ `prefers-reduced-motion`. Khi người dùng bật chế độ giảm chuyển động, animation và chuyển động mạnh sẽ được giảm xuống đáng kể, đồng thời autoplay cũng không tiếp tục chạy như bình thường.
- Có trạng thái `focus-visible` cho keyboard, để khi dùng `Tab` người dùng vẫn thấy card nào đang được chọn.
- Nội dung quan trọng không phụ thuộc hoàn toàn vào hover. Người dùng có thể chuyển giữa các thumbnail bằng bàn phím và tương tác với video mà không cần chuột.

## Ghi chú hiệu năng

Một số tối ưu chính đã được áp dụng trong phần này:

- Phần motion chủ yếu dùng `transform`, `opacity`, `scale` thay vì animate các thuộc tính dễ gây reflow như `top`, `left`, `width`, `height`.
- Tilt 3D được giới hạn ở mức nhẹ và update qua `requestAnimationFrame` để tránh giật khi di chuột liên tục.
- Có dùng `will-change` và `translateZ(0)` ở những phần thực sự có motion để tận dụng GPU hợp lý.
- Video để `preload="none"` để tránh tải sớm toàn bộ video khi người dùng chưa tương tác.
- Thumbnail dùng định dạng `.avif` để giữ chất lượng hiển thị nhưng vẫn tiết kiệm dung lượng hơn so với nhiều định dạng cũ.
- Khung video có `aspect-ratio` rõ ràng để hạn chế layout shift trong lúc tải.

## Nguồn ảnh / icon

- Thumbnail: dùng file trong thư mục `assets/thumbnails`.
- Video: dùng file trong thư mục `assets/videos`.
- Icon play/pause và progress ring: vẽ trực tiếp bằng SVG inline trong code, không dùng thư viện icon ngoài.

## Cấu trúc chính

- `index.html`: khung HTML của section
- `style.css`: style, motion, responsive, progress ring
- `script.js`: logic carousel, hover activation, video state, swipe mobile, keyboard và tilt
