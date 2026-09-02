/**
 * Bản dịch cho nội dung do giáo viên nhập trong bộ dữ liệu demo (lớp thí điểm 12/22):
 * tên bài tập, tên bước trên Workmap, tên gói và nội dung câu hỏi.
 *
 * Tách riêng khỏi `dictionary.ts` vì đây là dữ liệu minh hoạ, không phải chữ giao diện.
 * Chuỗi nào không có ở đây thì hiển thị nguyên văn tiếng Việt như dữ liệu gốc.
 */
export const EN_DATA: Record<string, string> = {
  // ---------- Tên bài tập ----------
  'Bài tập tự luận: Khảo sát sự biến thiên và vẽ đồ thị hàm số':
    'Written exercise: function variation and graph sketching',
  'Bài tập Khảo sát hàm số': 'Function analysis exercises',
  'Bài tập Hàm số mũ và logarit': 'Exponential and logarithm exercises',
  'Bài tập Nguyên hàm': 'Antiderivative exercises',
  'Bài tập Tích phân': 'Integral exercises',
  'Đề cương ôn tập giữa kỳ I - phần Giải tích': 'Mid-term I revision guide — calculus',
  'Đề cương ôn tập giữa kỳ I - phần Đại số': 'Mid-term I revision guide — algebra',
  'Bài tập chương Dao động cơ': 'Mechanical oscillation chapter exercises',
  'Bài tập Dao động điều hòa': 'Simple harmonic motion exercises',
  'Bài tập Sóng cơ và sóng âm': 'Mechanical and sound wave exercises',
  'Bài tập Sóng âm': 'Sound wave exercises',
  'Bài tập Điện xoay chiều': 'Alternating current exercises',
  'Bài tập Este - Lipit': 'Ester and lipid exercises',
  'Bài tập Este': 'Ester exercises',
  'Bài tập Amin - Amino axit': 'Amine and amino acid exercises',
  'Bài tập Polime': 'Polymer exercises',
  'Bài tập quy luật di truyền Menđen': "Mendel's laws of inheritance exercises",
  'Bài tập di truyền quần thể': 'Population genetics exercises',
  'Bài tập chương Tiến hóa': 'Evolution chapter exercises',
  'Bài tập Sinh thái học': 'Ecology exercises',
  'Bài tập lập trình Python: cấu trúc lặp': 'Python programming: loop structures',
  'Bài tập Python cơ bản': 'Basic Python exercises',
  'Bài tập Python: danh sách và chuỗi': 'Python: lists and strings',
  'Nghị luận xã hội: Tuổi trẻ và trách nhiệm với cộng đồng':
    'Social essay: youth and responsibility to the community',
  'Nghị luận xã hội: Giá trị của lòng biết ơn': 'Social essay: the value of gratitude',
  'Nghị luận xã hội: Sống có trách nhiệm với bản thân':
    'Social essay: living responsibly towards yourself',
  'Nghị luận xã hội về ý chí vươn lên trong cuộc sống':
    'Social essay on the will to rise in life',
  'Nghị luận văn học: Vẻ đẹp con người Việt Nam trong thơ ca kháng chiến':
    'Literary essay: the Vietnamese people in resistance poetry',
  'Viết bài luận phân tích tác phẩm sóng': 'Essay analysing the poem "Sóng"',
  'Kiểm tra Unit 1 - Life Stories: từ vựng và ngữ pháp':
    'Unit 1 test — Life Stories: vocabulary and grammar',
  'Kiểm tra Unit 1 - Life Stories': 'Unit 1 test — Life Stories',
  'Kiểm tra Unit 1: từ vựng và ngữ pháp': 'Unit 1 test: vocabulary and grammar',
  'Sơ đồ tư duy: Việt Nam giai đoạn 1919 - 1930': 'Mind map: Vietnam 1919-1930',
  'Sơ đồ tư duy: Việt Nam giai đoạn 1945 - 1954': 'Mind map: Vietnam 1945-1954',
  'Sơ đồ tư duy: Việt Nam giai đoạn 1954 - 1975': 'Mind map: Vietnam 1954-1975',
  'Sơ đồ tư duy: Cách mạng tháng Tám năm 1945': 'Mind map: the August 1945 Revolution',
  'Vẽ biểu đồ cơ cấu GDP theo khu vực kinh tế': 'Chart: GDP structure by economic sector',
  'Vẽ biểu đồ chuyển dịch cơ cấu kinh tế': 'Chart: economic structural shift',
  'Vẽ biểu đồ cơ cấu dân số theo nhóm tuổi': 'Chart: population structure by age group',
  'Vẽ biểu đồ cơ cấu ngành công nghiệp': 'Chart: industrial sector structure',
  'Bài tập đọc Atlat địa lý Việt Nam': 'Reading exercises with the Vietnam geographic atlas',
  'Bài tập tình huống: Hợp đồng lao động': 'Case study: employment contracts',
  'Bài tập tình huống: Hợp đồng dân sự': 'Case study: civil contracts',
  'Bài tập tình huống: Quyền và nghĩa vụ của công dân':
    "Case study: citizens' rights and duties",
  'Thuyết trình nhóm: Ứng dụng của sóng âm trong đời sống':
    'Group presentation: applications of sound waves in daily life',
  'Thuyết trình nhóm: Chiến dịch Điện Biên Phủ 1954':
    'Group presentation: the 1954 Dien Bien Phu campaign',
  'Báo cáo thu hoạch: Kỹ thuật băng bó cứu thương':
    'Field report: first-aid bandaging techniques',
  'Báo cáo thu hoạch: Kỹ thuật cấp cứu ban đầu': 'Field report: initial emergency care',
  'Báo cáo thu hoạch: Đội ngũ đơn vị': 'Field report: unit drill formation',
  'kiểm tra 15p lần 1': '15-minute test #1',
  'kiểm tra 15p lần 2': '15-minute test #2',
  'Bài GV giao 1786462526400': 'Teacher assignment 1786462526400',
  'Toán hình': 'Geometry',
  'Sắc Xuất': 'Probability',
  'Sắc xuất': 'Probability',
  'Einstein giải thích vậy': 'Einstein explained it that way',

  // ---------- Tên bước trên Workmap ----------
  'Ôn lý thuyết và xem lại ví dụ mẫu': 'Revise the theory and review worked examples',
  'Ôn công thức và ví dụ mẫu': 'Revise the formulas and worked examples',
  'Làm bài tập phần khảo sát': 'Do the function-analysis exercises',
  'Lập bảng biến thiên cho 2 hàm số': 'Build variation tables for 2 functions',
  'Lập bảng biến thiên cho 4 hàm số': 'Build variation tables for 4 functions',
  'Vẽ đồ thị và kiểm tra lại kết quả': 'Sketch the graph and check the result',
  'Vẽ đồ thị và nhận xét': 'Sketch the graph and comment',
  'Làm 10 bài nguyên hàm cơ bản': 'Do 10 basic antiderivative problems',
  'Làm 8 bài tích phân cơ bản': 'Do 8 basic integral problems',
  'Giải bài tập phương trình mũ': 'Solve the exponential equation exercises',
  'Giải bài tập phương trình logarit': 'Solve the logarithmic equation exercises',
  'Hoàn thành 15 câu trong đề cương': 'Complete 15 questions from the revision guide',
  'Hoàn thành 20 câu trong đề cương': 'Complete 20 questions from the revision guide',
  'Giải bài tập con lắc lò xo': 'Solve the spring pendulum exercises',
  'Giải bài tập con lắc đơn': 'Solve the simple pendulum exercises',
  'Giải bài tập con lắc lò xo và con lắc đơn':
    'Solve the spring and simple pendulum exercises',
  'Giải bài tập phương trình dao động': 'Solve the oscillation equation exercises',
  'Giải bài tập giao thoa sóng': 'Solve the wave interference exercises',
  'Giải bài tập cường độ và mức cường độ âm':
    'Solve the sound intensity and intensity-level exercises',
  'Giải bài tập mạch RLC nối tiếp': 'Solve the series RLC circuit exercises',
  'Bài tập danh pháp và tính chất của este': 'Ester nomenclature and properties exercises',
  'Bài tập danh pháp và tính chất': 'Nomenclature and properties exercises',
  'Bài tập danh pháp và phản ứng thủy phân': 'Nomenclature and hydrolysis exercises',
  'Bài tập thủy phân và bài toán hỗn hợp': 'Hydrolysis and mixture problems',
  'Bài toán hỗn hợp amino axit': 'Amino acid mixture problems',
  'Bài tập điều chế và tính chất polime': 'Polymer synthesis and properties exercises',
  'Giải bài tập lai một và hai cặp tính trạng':
    'Solve monohybrid and dihybrid cross problems',
  'Giải bài tập cân bằng Hacđi - Vanbec': 'Solve Hardy-Weinberg equilibrium problems',
  'Trả lời câu hỏi về bằng chứng tiến hóa': 'Answer the questions on evidence for evolution',
  'Trả lời câu hỏi về quần xã sinh vật': 'Answer the questions on biological communities',
  'Viết và chạy thử 5 bài tập vòng lặp': 'Write and test-run 5 loop exercises',
  'Viết và chạy thử 4 bài tập': 'Write and test-run 4 exercises',
  'Viết 3 chương trình nhỏ': 'Write 3 small programs',
  'Tìm hiểu đề và lập dàn ý': 'Study the prompt and build an outline',
  'Lập dàn ý và chọn dẫn chứng thơ': 'Build an outline and choose poetic evidence',
  'Tra cứu dẫn chứng thực tế': 'Research real-world evidence',
  'Viết mở bài và thân bài': 'Write the introduction and body',
  'Viết kết bài và hoàn thiện': 'Write the conclusion and finish',
  'Viết kết bài, rà soát và hoàn thiện': 'Write the conclusion, review and finish',
  'Viết đoạn văn nghị luận 200 chữ': 'Write a 200-word argumentative paragraph',
  'Viết hoàn chỉnh và rà soát': 'Write the full piece and review it',
  'Viết và tự sửa đoạn văn': 'Write the paragraph and self-edit it',
  'Viết bài mô tả theo dàn ý': 'Write the descriptive piece from the outline',
  'Viết bài phân tích 3 tình huống': 'Write the analysis of 3 case situations',
  'Viết nháp bố cục lá thư': 'Draft the letter structure',
  'Viết lá thư theo dàn ý cho sẵn': 'Write the letter from the given outline',
  'Học từ vựng Unit 1': 'Learn the Unit 1 vocabulary',
  'Học từ vựng và cấu trúc Unit 1': 'Learn the Unit 1 vocabulary and structures',
  'Học nhanh 20 từ vựng': 'Quickly learn 20 vocabulary items',
  'Ôn từ vựng và làm bài kiểm tra': 'Revise the vocabulary and take the test',
  'Ôn từ vựng và làm bài trắc nghiệm': 'Revise the vocabulary and take the quiz',
  'Làm bài kiểm tra trắc nghiệm': 'Take the multiple-choice test',
  'Đọc lại chương và hệ thống vở ghi': 'Re-read the chapter and organise your notes',
  'Hệ thống sự kiện và vẽ sơ đồ tư duy': 'Organise the events and draw the mind map',
  'Hệ thống sự kiện và vẽ sơ đồ': 'Organise the events and draw the diagram',
  'Chia nhánh theo từng giai đoạn': 'Split into branches by period',
  'Vẽ sơ đồ tư duy chương 3': 'Draw the chapter 3 mind map',
  'Vẽ hoàn chỉnh và bổ sung liên kết': 'Complete the drawing and add the links',
  'Xử lý số liệu và vẽ biểu đồ tròn': 'Process the data and draw the pie chart',
  'Xử lý số liệu và vẽ biểu đồ cột': 'Process the data and draw the bar chart',
  'Xử lý số liệu và vẽ biểu đồ miền': 'Process the data and draw the area chart',
  'Xử lý số liệu và vẽ tháp dân số': 'Process the data and draw the population pyramid',
  'Trả lời 10 câu hỏi khai thác Atlat': 'Answer 10 atlas-based questions',
  'Đọc tình huống và tra cứu điều luật': 'Read the case and look up the legal articles',
  'Phân tích 3 tình huống và trả lời câu hỏi': 'Analyse 3 cases and answer the questions',
  'Phân tích 3 tình huống hợp đồng': 'Analyse 3 contract cases',
  'Hoàn thiện slide và tập duyệt': 'Finish the slides and rehearse',
  'Viết báo cáo thu hoạch': 'Write the field report',
  'Viết báo cáo thu hoạch kèm hình minh họa': 'Write the field report with illustrations',

  // ---------- Bước do AI/giáo viên đặt tên ----------
  'Bước 1: Phân tích đề bài và huy động kiến thức':
    'Step 1: Analyse the prompt and recall the relevant knowledge',
  'Bước 2: Lập dàn ý chi tiết': 'Step 2: Build a detailed outline',
  'Bước 3: Viết Mở bài và các đoạn Thân bài':
    'Step 3: Write the introduction and body paragraphs',
  'Bước 4: Viết Kết bài': 'Step 4: Write the conclusion',
  'Bước 5: Đọc lại, chỉnh sửa và hoàn thiện bài viết':
    'Step 5: Re-read, revise and finish the piece',
  'Bước 1: Đọc lướt và xác định phạm vi nội dung (10 phút)':
    'Step 1: Skim the material and define the content scope (10 minutes)',
  'Bước 2: Phân tích sâu và trích xuất ý chính (20 phút)':
    'Step 2: Analyse in depth and extract the key ideas (20 minutes)',
  'Bước 3: Lập dàn ý/cấu trúc sơ đồ tư duy nháp (10 phút)':
    'Step 3: Draft the mind map outline and structure (10 minutes)',
  'Bước 4: Vẽ sơ đồ tư duy chính thức (10 phút)':
    'Step 4: Draw the final mind map (10 minutes)',
  'Bước 5: Rà soát, kiểm tra và hoàn thiện (5 phút)':
    'Step 5: Review, check and finish (5 minutes)',
  "Đọc lướt qua các bài từ 'Định luật Coulomb' đến 'Điện trường' trong sách Vật lý lớp 11 để nắm được tổng quan về các chủ đề chính, các khái niệm trọng tâm và mối liên hệ ban đầu giữa chúng. Xác định các nhánh lớn sẽ được thể hiện trên sơ đồ tư duy.":
    "Skim the lessons from 'Coulomb's law' to 'Electric field' in the grade 11 physics book to get an overview of the main topics, the core concepts and how they first relate. Identify the major branches the mind map will show.",
  'Đọc kỹ từng phần, ghi chú hoặc gạch chân các định nghĩa, công thức, đặc điểm, đơn vị, nguyên lý, và các ví dụ minh họa quan trọng. Tập trung vào việc cô đọng thông tin thành các từ khóa, cụm từ ngắn gọn, súc tích để đưa vào sơ đồ tư duy.':
    'Read each section closely, noting or underlining the definitions, formulas, properties, units, principles and key worked examples. Focus on condensing the information into short, precise keywords and phrases for the mind map.',
  'Trên giấy nháp hoặc bảng trắng, bắt đầu tổ chức các ý chính đã trích xuất. Xác định từ khóa trung tâm (ví dụ: Điện học lớp 11), các nhánh chính (ví dụ: Định luật Coulomb, Điện trường), và các nhánh phụ (ví dụ: Công thức, Đặc điểm, Đường sức điện). Sắp xếp theo thứ tự logic và phân cấp rõ ràng.':
    'On scrap paper or a whiteboard, start organising the extracted ideas. Pick the central keyword (e.g. Grade 11 electricity), the main branches (e.g. Coulomb\'s law, Electric field) and the sub-branches (e.g. Formulas, Properties, Field lines). Arrange them in a logical order with a clear hierarchy.',
  'Chuyển dàn ý nháp sang bản chính thức (trên giấy, phần mềm). Đảm bảo sơ đồ rõ ràng, sạch đẹp, dễ đọc. Sử dụng màu sắc khác nhau cho các nhánh chính, thêm các hình ảnh minh họa nhỏ (nếu có thể), và các mũi tên để chỉ rõ mối quan hệ giữa các khái niệm. Đảm bảo từ khóa được viết ngắn gọn và dễ hiểu.':
    'Transfer the draft outline to the final version (on paper or in software). Keep the diagram clear, tidy and readable. Use different colours for the main branches, add small illustrations where you can, and use arrows to show how the concepts relate. Keep the keywords short and easy to understand.',
  'Xem xét lại toàn bộ sơ đồ tư duy. Kiểm tra tính chính xác của thông tin, độ đầy đủ của các ý chính so với yêu cầu đề bài, sự rõ ràng, tính thẩm mỹ và tuân thủ các nguyên tắc của sơ đồ tư duy. Sửa chữa các lỗi hoặc bổ sung thông tin cần thiết.':
    'Review the whole mind map. Check that the information is accurate, that the key ideas cover the prompt, and that it is clear, tidy and follows mind-map principles. Fix any errors and add anything missing.',

  // ---------- Dàn ý mẫu trong dữ liệu ----------
  '1. Khái niệm mở đầu về Điện tích và Tương tác điện.':
    '1. Introductory concepts: electric charge and electrical interaction.',
  '2. Định luật Coulomb (nội dung, công thức, hằng số điện môi).':
    "2. Coulomb's law (statement, formula, dielectric constant).",
  '3. Thuyết êlectron (cấu tạo, vật dẫn/cách điện, nhiễm điện) và Định luật bảo toàn điện tích.':
    '3. Electron theory (structure, conductors/insulators, charging) and conservation of charge.',
  '4. Điện trường (khái niệm, tính chất, nguyên lí chồng chất điện trường).':
    '4. Electric field (concept, properties, superposition principle).',
  '5. Cường độ điện trường (định nghĩa, công thức, vectơ, đơn vị) và Đường sức điện (khái niệm, đặc điểm).':
    '5. Field strength (definition, formula, vector, units) and field lines (concept, properties).',

  // ---------- Gói câu hỏi & nội dung câu hỏi ----------
  'Hình học không gian': 'Solid geometry',
  'Ôn tập kiểm tra giữa kỳ II năm học 2025-2026': 'Revision for the 2025-2026 mid-term II test',
  'Chứng minh 2 mặt phẳng vuông góc với nhau': 'Prove that two planes are perpendicular',
  '2 đường thẳng chéo nhau': 'Two skew lines',
  '2 đường thẳng cắt nhau': 'Two intersecting lines',
  '2 đường thẳng thuộc 2 mp song song': 'Two lines in two parallel planes',
  '2 đường thẳng thuộc 2 mặt phẳng khác nhau vuông góc':
    'Two lines in two different perpendicular planes',
  'Cho phương trình x^2 - 4 = 0. Nghiệm của phương trình là gì?':
    'Given the equation x^2 - 4 = 0, what are its roots?',
  'Vô nghiệm': 'No solution',
  'Phương trình tương đương x^2 = 4 => x = ±2.':
    'The equation is equivalent to x^2 = 4, so x = ±2.',
  'Định lý Py-ta-go áp dụng cho tam giác nào?':
    'The Pythagorean theorem applies to which triangle?',
  'Tam giác vuông': 'Right triangle',
  'Tam giác đều': 'Equilateral triangle',
  'Tam giác cân': 'Isosceles triangle',
  'Tam giác tù': 'Obtuse triangle',
  'Định lý Py-ta-go phát biểu trong tam giác vuông: a^2 + b^2 = c^2.':
    'The Pythagorean theorem states that in a right triangle a^2 + b^2 = c^2.',
  'Giải bất phương trình: 2x - 4 > 0.': 'Solve the inequality 2x - 4 > 0.',
};

export default EN_DATA;
