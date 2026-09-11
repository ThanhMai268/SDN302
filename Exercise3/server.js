const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
    const url = req.url;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (url === '/') {
        res.statusCode = 200;
        res.end('Chao mung ban den voi home\n');
    }
    else if (url === '/about') {
        res.statusCode = 200;
        res.end('Đây là trang Giới thiệu (About)\n');
    } 
    else if (url === '/contact') {
        res.statusCode = 200;
        res.end('Đây là trang Liên hệ (Contact)\n');
    } 
    else {
        // Xử lý các URL không tồn tại (Lỗi 404)
        res.statusCode = 404;
        res.end('Lỗi 404: Không tìm thấy trang bạn yêu cầu.\n');
    }
});

server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// demo xử lý với nhiều URL
// localhost:3000/ : trang chủ
// localhost:3000/about
// localhost:3000/contact
