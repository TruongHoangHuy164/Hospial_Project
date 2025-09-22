import React from 'react';
import { Link } from 'react-router-dom';

export default function GuidePage(){
  return (
    <div className="container py-4">
      <header className="mb-4 text-center">
        <h2>Hướng dẫn khám bệnh theo từng bước</h2>
        <p className="text-muted">Chuẩn bị đầy đủ giấy tờ, đặt lịch trước để tiết kiệm thời gian và theo chỉ dẫn tại bệnh viện.</p>
      </header>

      <ol className="list-unstyled">
        <li className="card shadow-sm mb-3">
          <div className="p-3">
            <h5 className="mb-2">Bước 1: Chuẩn bị thông tin</h5>
            <p>Chuẩn bị CMND/CCCD, thẻ BHYT (nếu có), sổ khám bệnh cũ (nếu có), và thông tin liên lạc. Đối với đặt lịch hộ người thân, vui lòng có thông tin của người được khám.</p>
            <ul>
              <li>Giấy tờ tùy thân và thẻ BHYT còn hiệu lực.</li>
              <li>Danh sách triệu chứng, bệnh sử, thuốc đang sử dụng.</li>
              <li>Liên hệ hỗ trợ nếu cần tư vấn trước khi đến.</li>
            </ul>
          </div>
        </li>

        <li className="card shadow-sm mb-3">
          <div className="p-3">
            <h5 className="mb-2">Bước 2: Đặt lịch khám trực tuyến</h5>
            <p>Truy cập trang đặt lịch, điền hồ sơ bệnh nhân, chọn chuyên khoa và ngày khám phù hợp. Hệ thống sẽ gợi ý bác sĩ và khung giờ còn trống.</p>
            <div className="mt-2">
              <Link className="btn btn-primary" to="/booking"><i className="bi bi-calendar2-check"/> Đặt lịch ngay</Link>
            </div>
          </div>
        </li>

        <li className="card shadow-sm mb-3">
          <div className="p-3">
            <h5 className="mb-2">Bước 3: Thanh toán và nhận số thứ tự</h5>
            <p>Hoàn tất thanh toán trực tuyến theo hướng dẫn. Sau khi thanh toán thành công, hệ thống sẽ cấp số thứ tự khám. Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>
          </div>
        </li>

        <li className="card shadow-sm mb-3">
          <div className="p-3">
            <h5 className="mb-2">Bước 4: Đến bệnh viện và làm thủ tục</h5>
            <p>Đến quầy tiếp nhận theo hướng dẫn tại khu khám. Xuất trình số thứ tự, giấy tờ tùy thân và thẻ BHYT (nếu có) để được hướng dẫn vào phòng khám.</p>
            <ul>
              <li>Đến sớm 10–15 phút trước giờ khám.</li>
              <li>Tuân thủ hướng dẫn điều phối tại bệnh viện.</li>
            </ul>
          </div>
        </li>

        <li className="card shadow-sm mb-3">
          <div className="p-3">
            <h5 className="mb-2">Bước 5: Khám bệnh và nhận chỉ định</h5>
            <p>Vào phòng khám theo số thứ tự, gặp bác sĩ để thăm khám. Thực hiện các chỉ định cận lâm sàng (nếu có) và nhận đơn thuốc/điều trị.</p>
          </div>
        </li>
      </ol>

      <div className="text-center mt-4">
        <Link className="btn btn-outline-primary" to="/booking">Đặt lịch khám ngay</Link>
      </div>
    </div>
  );
}
