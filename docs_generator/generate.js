const puppeteer = require('puppeteer');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } = require('docx');

async function run() {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Waiting for Next.js server to be ready...');
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 5000 });
      serverReady = true;
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!serverReady) {
    console.error('Next.js server did not start in time.');
    await browser.close();
    process.exit(1);
  }

  // 1. Capture Teacher Dashboard
  console.log('Navigating to /teacher...');
  await page.goto('http://localhost:3000/teacher', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const teacherImg = await page.screenshot({ encoding: 'base64' });

  // 2. Capture Teacher Essay AI Breakdown
  console.log('Simulating AI Essay Breakdown in /teacher...');
  try {
    await page.type('input[placeholder="Nhập tên bài tập..."]', 'Phân tích bài thơ Sóng');
    
    await page.evaluate(() => {
      const step2Btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Bước 2'));
      if (step2Btn) step2Btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const typeSelect = selects.find(s => Array.from(s.options).some(o => o.value === 'essay'));
      if (typeSelect) {
        typeSelect.value = 'essay';
        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      const step3Btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Bước 3'));
      if (step3Btn) step3Btn.click();
    });
    
    // Wait for the Confirm Modal to appear
    await new Promise(r => setTimeout(r, 1000));

    // Click the Confirm button in the modal
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Xác Nhận & Sang Cấu Hình AI'));
      if (confirmBtn) confirmBtn.click();
    });

    // WAIT 20 SECONDS FOR GEMINI AI TO FINISH GENERATING!
    console.log('Waiting 20 seconds for Gemini AI to generate the breakdown...');
    await new Promise(r => setTimeout(r, 20000));
    
  } catch (e) {
    console.log('Could not simulate essay breakdown:', e);
  }
  const essayImg = await page.screenshot({ encoding: 'base64' });

  // 3. Capture Teacher Workmap expanded
  console.log('Expanding Workmap in /teacher...');
  try {
    await page.goto('http://localhost:3000/teacher', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const toggleBtn = btns.find(b => b.textContent.includes('Xem lịch Workmap'));
      if (toggleBtn) toggleBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Could not find workmap toggle button');
  }
  const workmapImg = await page.screenshot({ encoding: 'base64' });

  // 4. Capture Student Dashboard
  console.log('Navigating to /student...');
  await page.goto('http://localhost:3000/student', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const studentImg = await page.screenshot({ encoding: 'base64' });

  // 5. Capture Student Profile Modal
  console.log('Opening Student Profile modal...');
  try {
    await page.evaluate(() => {
      const span = Array.from(document.querySelectorAll('span, button')).find(el => el.textContent.includes('Lớp'));
      if (span) span.click();
    });
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Could not find student profile button');
  }
  const studentModalImg = await page.screenshot({ encoding: 'base64' });

  await browser.close();
  console.log('Screenshots captured. Generating DOCX...');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "NEXUS - HỆ SINH THÁI LẬP KẾ HOẠCH & QUẢN LÝ HỌC TẬP THÔNG MINH",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Dự án EdTech đột phá giúp giải quyết bài toán quá tải bài tập và tối ưu hóa thời gian tự học cho học sinh, đồng thời hỗ trợ giáo viên phân bổ khối lượng kiến thức một cách khoa học nhất.", italics: true }),
            ],
            spacing: { after: 400 },
          }),
          
          new Paragraph({
            text: "1. Giao diện Giáo Viên & Chống Quá Tải",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Giáo viên sở hữu một Dashboard mạnh mẽ, cho phép tạo các dạng bài tập khác nhau: trắc nghiệm nguyên khối, tự luận, biểu đồ, dự án... Các form tạo bài tập được tối ưu hóa cho trải nghiệm mượt mà, bao gồm lựa chọn lớp học, môn học và thời hạn chi tiết."
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(teacherImg, 'base64'),
                transformation: { width: 600, height: 375 },
                type: 'png'
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            text: "Theo dõi Tải trọng với Workmap Calendar",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Tính năng quan trọng nhất của giáo viên là Lịch Workmap. Thay vì giao bài tập mù quáng, hệ thống sẽ thống kê tổng số lượng bài tập của tất cả các môn học mà lớp đó đang gánh chịu trong tuần. Giáo viên có thể xem trực quan qua biểu đồ nhiệt (Heatmap) hoặc dạng lịch ngày để đưa ra quyết định giao bài phù hợp, tránh dồn ép học sinh."
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(workmapImg, 'base64'),
                transformation: { width: 600, height: 375 },
                type: 'png'
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            text: "2. Tính năng AI: Tự Động Chia Nhỏ Bài Luận (AI Task Breakdown)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Với các bài tập phức tạp và có khối lượng lớn như Viết Luận (Essay) hay Làm Dự Án (Project), Nexus tích hợp tính năng AI (Gemini 1.5 Pro) để phân tích yêu cầu đề bài. Hệ thống AI tự động: (1) Lên dàn ý sơ bộ, (2) Chia nhỏ một bài tập khổng lồ thành các bước thực hiện nhỏ hơn (VD: Thu thập tài liệu, Lập dàn ý, Viết nháp, Chỉnh sửa), và (3) Tự động chèn các bước này rải rác vào các ngày trống trên lịch của học sinh một cách mượt mà nhất."
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(essayImg, 'base64'),
                transformation: { width: 600, height: 375 },
                type: 'png'
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),
          
          new Paragraph({
            text: "3. Giao diện Học Sinh & Gamification (Timeline View)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Học sinh không còn phải dùng sổ tay hay nhiều phần mềm để ghi nhớ deadline. Mọi công việc đã được giáo viên giao và hệ thống chia nhỏ sẽ xuất hiện theo dạng thẻ (Cards) trên luồng Timeline theo các ngày trong tuần. Giao diện đầy màu sắc (Gamification) kích thích động lực học tập, giúp học sinh có thể check-off công việc để tạo cảm giác đạt được thành tựu nhỏ mỗi ngày."
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(studentImg, 'base64'),
                transformation: { width: 600, height: 375 },
                type: 'png'
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            text: "Cá Nhân Hóa Trải Nghiệm Học Tập",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Học sinh dễ dàng tùy chỉnh hồ sơ bản thân, chuyển đổi lớp học linh hoạt ngay trong ứng dụng mà không cần phải chờ xét duyệt phức tạp. Dữ liệu thời gian thực được đồng bộ lại toàn bộ Workmap tùy thuộc vào lớp đang chọn."
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(studentModalImg, 'base64'),
                transformation: { width: 600, height: 375 },
                type: 'png'
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('d:/Nexus/Nexus_Features.docx', buffer);
  console.log('Success! Saved to d:/Nexus/Nexus_Features.docx');
}

run().catch(err => {
  console.error('Error during generation:', err);
  process.exit(1);
});
