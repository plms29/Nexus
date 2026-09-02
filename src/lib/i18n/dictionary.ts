/**
 * Từ điển Việt -> Anh cho toàn bộ chữ hiển thị trong ứng dụng.
 *
 * Key chính là chuỗi tiếng Việt gốc trong JSX, nên khi thiếu bản dịch thì
 * `translate()` trả về nguyên văn tiếng Việt thay vì hiện chuỗi rỗng.
 * Khoảng trắng của key đã được gộp về một dấu cách (xem `normalize`).
 */
export const EN: Record<string, string> = {
  // ---------- Trang chủ (landing) ----------
  'Đăng nhập': 'Sign in',
  'Đăng ký ngay': 'Sign up now',
  'Nền tảng Giáo dục Thông minh 2.0': 'Smart Education Platform 2.0',
  'Quản lý khối lượng học tập': 'Manage study workload',
  'hiệu quả & khoa học.': 'effectively & scientifically.',
  'ExamLoad Radar kết nối Giáo viên và Học sinh thông qua hệ thống Workmap tự động. Tối ưu hóa thời gian, cân bằng môn học và nâng cao hiệu suất ôn thi.':
    'ExamLoad Radar connects teachers and students through an automated Workmap. Optimise time, balance subjects and boost exam preparation.',
  'Đăng ký tài khoản mới': 'Create a new account',
  'Đăng nhập hệ thống': 'Sign in to the system',
  'Hiệu suất học tập': 'Study performance',
  'Chỉ số Workmap': 'Workmap index',
  'Học sinh sử dụng': 'Students using it',
  'Giáo viên tin dùng': 'Teachers trust it',
  'Đề thi đã tạo': 'Tests created',
  'Cải thiện điểm số': 'Grade improvement',
  'Tính năng đột phá': 'Breakthrough features',
  'Hệ sinh thái giáo dục toàn diện, phân quyền thông minh dành riêng cho trường THPT.':
    'A complete education ecosystem with smart role-based access built for high schools.',
  'Workmap Thông Minh': 'Smart Workmap',
  'Tự động lập lịch biểu học tập cá nhân hóa cho học sinh, trực quan hóa cường độ học tập bằng hệ số Load Units (LU).':
    'Automatically builds a personalised study schedule and visualises study intensity with Load Units (LU).',
  'Quản lý Đề Thi Đa Năng': 'All-in-one test management',
  'Cung cấp công cụ thiết lập Quiz và Essay chuẩn xác, xuất file PDF cho Giáo viên ngay trên hệ thống. Tính toán thời gian tự động.':
    'Precise quiz and essay setup tools with PDF export for teachers, plus automatic time calculation.',
  'Phân Quyền Chi Tiết': 'Fine-grained permissions',
  'Tích hợp luồng Onboarding nhận diện Ban tự nhiên và Ban xã hội, tùy chỉnh giao diện riêng cho mỗi giáo viên và học sinh.':
    'An onboarding flow that detects the Science or Humanities track and tailors the interface for every teacher and student.',
  'Sẵn sàng để bứt phá điểm số?': 'Ready to break through your grades?',
  'Tham gia cùng hàng ngàn giáo viên và học sinh đang sử dụng ExamLoad Radar mỗi ngày để tối ưu hóa quá trình dạy và học.':
    'Join thousands of teachers and students using ExamLoad Radar every day to optimise teaching and learning.',
  'Tạo tài khoản miễn phí': 'Create a free account',
  'Hệ thống Quản lý Khối lượng Học tập thông minh, giúp học sinh cân bằng cuộc sống và đạt kết quả cao trong các kỳ thi.':
    'A smart study-workload management system that helps students balance life and excel in exams.',
  'Sản phẩm': 'Product',
  'Tính năng': 'Features',
  'Bảng giá': 'Pricing',
  'Hướng dẫn': 'Guides',
  'Công ty': 'Company',
  'Về chúng tôi': 'About us',
  'Liên hệ': 'Contact',
  'Bảo mật': 'Privacy',

  // ---------- Đăng nhập / Đăng ký ----------
  'Nền tảng Quản lý Đề thi & Khối lượng học tập': 'Test & study-workload management platform',
  'Học tập hiệu quả hơn,': 'Learn more effectively,',
  'giảng dạy thông minh hơn.': 'teach more intelligently.',
  'Hệ sinh thái phân quyền độc đáo hỗ trợ Giáo viên thiết lập bài tập khoa học và Giúp Học sinh kiểm soát áp lực thi cử.':
    'A unique role-based ecosystem that helps teachers design balanced assignments and students manage exam pressure.',
  'Mã hóa mật khẩu an toàn': 'Secure password encryption',
  'Phân quyền vai trò': 'Role-based access',
  'Giáo viên & Học sinh': 'Teachers & students',
  'Trang chủ': 'Home',
  'Chào mừng trở lại! 👋': 'Welcome back! 👋',
  'Tạo tài khoản mới 🚀': 'Create a new account 🚀',
  'Đăng nhập bằng Email & Mật khẩu để tiếp tục': 'Sign in with your email and password to continue',
  'Đăng ký tài khoản Supabase với vai trò mong muốn': 'Create a Supabase account with the role you want',
  'Đăng Nhập': 'Sign In',
  'Đăng Ký Mới': 'Sign Up',
  'Email Tài Khoản': 'Account email',
  'Mật Khẩu': 'Password',
  'Quên mật khẩu?': 'Forgot password?',
  'Chọn Vai Trò Của Bạn:': 'Choose your role:',
  'Giáo Viên': 'Teacher',
  'Soạn đề & Quản lý lớp': 'Create tests & manage classes',
  'Học Sinh': 'Student',
  'Làm bài & Theo dõi Radar': 'Do assignments & track the Radar',
  'Họ và Tên': 'Full name',
  'Email Đăng Ký': 'Sign-up email',
  'Mật Khẩu (Tối thiểu 6 ký tự)': 'Password (at least 6 characters)',
  'Nhập Lại Mật Khẩu': 'Confirm password',
  'Mật khẩu nhập lại chưa trùng khớp': 'Passwords do not match yet',
  'Đăng Ký Tài Khoản': 'Create account',
  'Ví dụ: Thầy Nguyễn Văn A': 'e.g. Mr. Nguyen Van A',
  'Ví dụ: Nguyễn Văn Học': 'e.g. Nguyen Van Hoc',
  'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.':
    'Sign-in failed. Please check your email and password.',
  'Vui lòng nhập Họ và tên của bạn.': 'Please enter your full name.',
  'Mật khẩu phải có ít nhất 6 ký tự.': 'Password must be at least 6 characters.',
  'Mật khẩu nhập lại không trùng khớp. Vui lòng kiểm tra lại!':
    'The passwords do not match. Please check again!',
  'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.':
    'Sign-up failed. Please check your details.',
  'Đăng ký thành công! Vui lòng điền thông tin cá nhân...':
    'Sign-up successful! Please fill in your personal details...',
  'Đăng ký thất bại. Email có thể đã tồn tại hoặc không hợp lệ.':
    'Sign-up failed. The email may already exist or be invalid.',

  // ---------- Auth callback / chọn vai trò ----------
  'Đang xác thực thông tin tài khoản Google...': 'Verifying your Google account...',
  'Kiểm tra quyền truy cập hệ thống...': 'Checking system access...',
  'Vui lòng đợi trong giây lát...': 'Please wait a moment...',
  'Đang kết nối Gmail Auth': 'Connecting to Gmail Auth',
  'Xác nhận đăng nhập': 'Confirm sign-in',
  'Chào mừng bạn! Bạn là': 'Welcome! You are',
  'Vui lòng chọn vai trò phù hợp để hệ thống thiết lập lộ trình làm việc & phân quyền công cụ chính xác cho bạn.':
    'Choose the role that fits you so the system can set up the right workflow and tools.',
  'Chọn Vai Trò Giáo Viên': 'Choose the teacher role',
  'Chọn Vai Trò Học Sinh': 'Choose the student role',
  'Giáo Viên Trung Học': 'High school teacher',
  'Học Sinh Trung Học': 'High school student',
  'Dành cho Thầy / Cô': 'For teachers',
  'Dành cho Học Sinh': 'For students',
  'Giao bài nhanh chóng & tự động xếp lịch.': 'Assign work quickly and schedule it automatically.',
  'Làm bài trực tuyến & nộp tự luận': 'Do assignments online & submit essays',
  'Đang khởi tạo tài khoản Giáo viên...': 'Setting up your teacher account...',
  'Đang khởi tạo tài khoản Học sinh...': 'Setting up your student account...',
  'Đang chuẩn bị hồ sơ đăng ký...': 'Preparing your registration profile...',
  'Có lỗi xảy ra khi lưu vai trò. Vui lòng thử lại!':
    'Something went wrong while saving your role. Please try again!',
  'Không thể lưu vai trò vào cơ sở dữ liệu:': 'Could not save the role to the database:',
  'Đăng Ký Tài Khoản Mới Với Gmail Auth': 'Create a new account with Gmail Auth',
  '© 2026 ExamLoad Radar. Bảo mật thông tin qua Supabase Auth E2E encryption.':
    '© 2026 ExamLoad Radar. Secured with Supabase Auth E2E encryption.',

  // ---------- Onboarding giáo viên ----------
  'BƯỚC 1 / 3': 'STEP 1 / 3',
  'BƯỚC 2 / 3': 'STEP 2 / 3',
  'BƯỚC 3 / 3': 'STEP 3 / 3',
  'Hồ sơ': 'Profile',
  'Chuyên môn': 'Subjects',
  'Lớp dạy': 'Classes',
  'Thông tin hồ sơ giáo viên': 'Teacher profile details',
  'Nhập tên của thầy/cô, trường THPT và Tỉnh/Thành phố đang công tác để cá nhân hóa hệ thống.':
    'Enter your name, high school and province so the system can personalise itself.',
  'Họ và Tên Giáo Viên': "Teacher's full name",
  'Trường THPT': 'High school',
  'Tỉnh / Thành Phố': 'Province / City',
  'Ví dụ: Nguyễn Văn A': 'e.g. Nguyen Van A',
  'Ví dụ: THPT Chuyên Lê Quý Đôn': 'e.g. Le Quy Don Gifted High School',
  'Ví dụ: Đà Nẵng': 'e.g. Da Nang',
  'Vui lòng điền đầy đủ thông tin': 'Please fill in every field',
  'Tiếp tục': 'Continue',
  'Tiếp theo': 'Next',
  'Quay lại': 'Back',
  'Trang trước': 'Previous',
  'Trang sau': 'Next page',
  'Hoàn Tất': 'Finish',
  'Chọn Tổ hợp và Bộ môn phụ trách': 'Choose your track and subjects',
  'Cấp THPT Việt Nam phân chia 2 ban chính. Vui lòng chọn Ban rồi chọn Môn học tương ứng.':
    'Vietnamese high schools have two main tracks. Pick a track, then pick your subjects.',
  'BAN TỰ NHIÊN': 'SCIENCE TRACK',
  'BAN XÃ HỘI': 'HUMANITIES TRACK',
  'Ban Tự nhiên': 'Science track',
  'Ban Xã hội': 'Humanities track',
  'Toán, Lý, Hóa, Sinh, Tin, Công nghệ': 'Maths, Physics, Chemistry, Biology, IT, Technology',
  'Văn, Sử, Địa, Ngoại ngữ, KT&PL, GDTC, QPAN, Nghệ thuật':
    'Literature, History, Geography, Languages, Economics & Law, PE, Defence, Arts',
  'Vui lòng chọn ít nhất một bộ môn': 'Please choose at least one subject',
  'Vui lòng chọn ít nhất một lớp học': 'Please choose at least one class',
  'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.':
    'Something went wrong while saving. Please try again.',
  'Đăng ký lớp học phụ trách': 'Register the classes you teach',
  'Chọn một hoặc nhiều lớp thầy/cô đang giảng dạy các bộ môn đã chọn trong học kỳ này.':
    'Select one or more classes you teach these subjects to this term.',
  'CHỌN BỘ MÔN GIẢNG DẠY TRONG': 'CHOOSE THE SUBJECTS YOU TEACH IN',
  'MÔN HỌC': 'SUBJECT',
  'KHỐI': 'GRADE',
  'Hệ thống phân quyền thông minh dành riêng cho giáo viên bộ môn Trung học Phổ thông tại Việt Nam. Tự động cá nhân hóa công cụ giảng dạy, sổ điểm và tài nguyên chuyên môn dựa trên Ban học':
    'A smart permission system built for Vietnamese high school subject teachers. It personalises teaching tools, gradebooks and resources based on your track.',
  '\"Dưới ánh mặt trời không có nghề nào cao quý hơn nghề dạy học.\"':
    '\"Under the sun there is no profession nobler than teaching.\"',
  'thuộc ban': 'in the',
  'tự nhiên': 'science',
  'xã hội': 'humanities',
  'Tự nhiên': 'Science',
  'Xã hội': 'Humanities',

  // Tên môn học & mô tả (onboarding bước 2)
  'Toán': 'Maths',
  'Toán học': 'Mathematics',
  'Đại số, Hình học, Giải tích và Xác suất thống kê THPT':
    'Algebra, geometry, calculus and statistics at high school level',
  'Vật lý': 'Physics',
  'Cơ học, Nhiệt học, Điện từ học, Quang học và Vật lý hạt nhân':
    'Mechanics, thermodynamics, electromagnetism, optics and nuclear physics',
  'Hóa học': 'Chemistry',
  'Hóa học vô cơ, Hóa học hữu cơ và các phản ứng thực nghiệm':
    'Inorganic chemistry, organic chemistry and laboratory reactions',
  'Sinh học': 'Biology',
  'Di truyền học, Tiến hóa, Sinh thái học và Cơ thể sinh vật':
    'Genetics, evolution, ecology and organism physiology',
  'Tin học': 'Computer Science',
  'Lập trình, Cơ sở dữ liệu và Ứng dụng công nghệ thông tin':
    'Programming, databases and applied information technology',
  'Công nghệ': 'Technology',
  'Công nghiệp, Nông nghiệp và Định hướng nghề nghiệp':
    'Industry, agriculture and career orientation',
  'Ngữ Văn': 'Literature',
  'Ngữ văn': 'Literature',
  'Văn học Việt Nam, Văn học nước ngoài, Làm văn và Tiếng Việt':
    'Vietnamese literature, world literature, composition and Vietnamese language',
  'Tiếng Anh': 'English',
  'Ngữ pháp, Từ vựng, Kỹ năng nghe nói đọc viết chuẩn đầu ra':
    'Grammar, vocabulary and the four output skills',
  'Tiếng Pháp': 'French',
  'Ngôn ngữ và văn hóa Pháp': 'French language and culture',
  'Tiếng Trung': 'Chinese',
  'Ngôn ngữ và văn hóa Trung Quốc': 'Chinese language and culture',
  'Tiếng Nhật': 'Japanese',
  'Ngôn ngữ và văn hóa Nhật Bản': 'Japanese language and culture',
  'Tiếng Nga': 'Russian',
  'Ngôn ngữ và văn hóa Nga': 'Russian language and culture',
  'Tiếng Hàn': 'Korean',
  'Ngôn ngữ và văn hóa Hàn Quốc': 'Korean language and culture',
  'Tiếng Đức': 'German',
  'Ngôn ngữ và văn hóa Đức': 'German language and culture',
  'Kinh tế & Pháp luật': 'Economics & Law',
  'Kiến thức kinh tế cơ bản, pháp luật và quyền công dân Việt Nam':
    'Basic economics, law and Vietnamese civic rights',
  'Địa lý': 'Geography',
  'Địa lý tự nhiên, Địa lý dân cư và Địa lý kinh tế Việt Nam':
    'Physical, population and economic geography of Vietnam',
  'Lịch sử': 'History',
  'Lịch sử Việt Nam qua các thời kỳ và Lịch sử thế giới cận hiện đại':
    'Vietnamese history through the ages and modern world history',
  'Giáo dục Thể chất': 'Physical Education',
  'Rèn luyện thể lực, kỹ năng vận động và thể thao':
    'Fitness training, motor skills and sport',
  'GD Quốc phòng & An ninh': 'Defence & Security Education',
  'Kiến thức quốc phòng, an ninh và kỹ năng quân sự':
    'National defence, security knowledge and military skills',
  'Âm nhạc': 'Music',
  'Lý thuyết âm nhạc, Thanh nhạc và Nhạc cụ': 'Music theory, vocals and instruments',
  'Mĩ thuật': 'Fine Arts',
  'Hội họa, Điêu khắc và Lịch sử mĩ thuật': 'Painting, sculpture and art history',

  // ---------- Khung giáo viên ----------
  'Hệ Thống Lập Kế Hoạch & Thiết Kế Đề Thi': 'Test planning & design system',
  'Chuyên môn hóa cho Giáo viên • Quản lý cấu trúc thời gian và câu hỏi thông minh':
    'Built for teachers • Smart time structure and question management',
  'Đăng xuất': 'Sign out',
  'CÁC BƯỚC THỰC HIỆN': 'WORKFLOW STEPS',
  'CÁC BƯỚC THỰC HIỆN (HỌC SINH)': 'WORKFLOW STEPS (STUDENT)',
  '1. Thiết lập & Sinh đề': '1. Set up & generate',
  '2. Ngân hàng câu hỏi': '2. Question bank',
  '"2. Ngân hàng câu hỏi"': '"Question bank"',
  '3. Quản lý bài tập & Đề thi': '3. Manage assignments & tests',
  'Gói': 'packs',
  'XUẤT ĐỀ KIỂM TRA': 'EXPORT THE TEST',
  'In đề thi & Lời giải (PDF)': 'Print test & answer key (PDF)',
  'Lưu Đề Lên Hệ Thống': 'Save test to the system',
  'NHẬP ĐỀ THI CÓ SẴN': 'IMPORT AN EXISTING TEST',
  'Chọn file JSON đề thi': 'Choose a test JSON file',

  // ---------- Form giao bài ----------
  'Tạo Bài Tập Mới': 'Create a new assignment',
  'Tên Bài Tập': 'Assignment name',
  'Tên bài tập': 'Assignment name',
  'Tên bài tập / Chủ đề essay': 'Assignment name / essay topic',
  'Nhập tên bài tập...': 'Enter the assignment name...',
  'Vui lòng nhập tên bài tập!': 'Please enter an assignment name!',
  'Vui lòng nhập tên bài tập trước!': 'Please enter the assignment name first!',
  'Bước 1: Thông tin': 'Step 1: Details',
  'Bước 2: Thời hạn': 'Step 2: Deadline',
  'Bước 3: Cấu hình': 'Step 3: Configuration',
  'Bộ môn': 'Subject',
  'Bộ môn & Dạng': 'Subject & type',
  'Dạng Bài': 'Assignment type',
  'Dạng bài:': 'Type:',
  'Hình Thức': 'Format',
  'Hình thức': 'Format',
  'Hình thức:': 'Format:',
  'Cá nhân': 'Individual',
  'Làm nhóm': 'Group work',
  'Trắc nghiệm': 'Multiple choice',
  'Bài Luận Essay': 'Essay',
  'Bài luận Essay': 'Essay',
  'Bài tập essay': 'Essay assignment',
  'Cho Lớp': 'For class',
  'Lớp': 'Class',
  'Lớp:': 'Class:',
  'Lớp học': 'Class',
  'Chưa chọn lớp': 'No class selected',
  'hiện chưa có bài tập nào được giao từ giáo viên trên hệ thống database.':
    'has no assignments from teachers in the database yet.',
  'Ngày Giao': 'Assigned on',
  'Hạn Nộp': 'Due date',
  'Hạn nộp': 'Due date',
  'Hạn nộp:': 'Due:',
  'Hạn Nộp Mới': 'New due date',
  'Số Phút Dự Kiến': 'Estimated minutes',
  'Thời gian làm bài dự kiến': 'Estimated working time',
  'Xem Phân Bổ Workload & Giao Bài': 'Preview workload & assign',
  'Xem trước Workmap': 'Preview the Workmap',
  'Xác Nhận & Chính Thức Giao Bài': 'Confirm & assign officially',
  'Xác Nhận & Sang Cấu Hình AI ➔': 'Confirm & go to AI setup ➔',
  'Chọn Gói Câu Hỏi (Từ Supabase DB)': 'Choose a question pack (from Supabase DB)',
  'Chưa có gói câu hỏi nào. Vui lòng chuyển sang mục "Ngân hàng câu hỏi" để tạo gói!':
    'There are no question packs yet. Go to "Question bank" to create one!',
  'Gói câu hỏi đã chọn chưa có câu hỏi nào. Vui lòng chọn gói khác!':
    'The selected pack has no questions. Please choose another one!',
  'Sang Ngân Hàng Câu Hỏi Để Tạo Gói': 'Go to the question bank to create a pack',
  'Vui lòng chuyển sang mục': 'Please switch to',
  'để tạo gói mới hoặc upload file CSV trước khi giao bài.':
    'to create a pack or upload a CSV file before assigning.',
  'câu hỏi sẵn có': 'questions available',
  'Không lưu được nhật ký ghi đè:': 'Could not save the override log:',
  'lỗi không xác định': 'unknown error',
  'Giao Bài Tập Thành Công!': 'Assignment created!',
  'đã được lưu và xếp lịch thành công.': 'has been saved and scheduled successfully.',
  '. Đã đồng bộ Supabase DB.': '. Synced with the Supabase DB.',
  'Hoàn Tất & Quay Lại Workmap': 'Finish & back to the Workmap',

  // ---------- Quiz setup ----------
  'Thiết lập bài tập Trắc nghiệm / Tự luận': 'Set up a multiple-choice / essay assignment',
  'Phân Bổ Cấu Trúc Đề & Thời Gian': 'Test structure & time allocation',
  'Thiết lập tỷ lệ câu hỏi và cấu hình thời gian làm bài tối đa cho từng cấp độ.':
    'Set the question mix and the maximum working time for each cognitive level.',
  'Ma trận câu hỏi AI L1 - L4': 'AI question matrix L1 - L4',
  'Mức độ nhận thức': 'Cognitive level',
  'Độ Khó': 'Difficulty',
  'Số Lượng Câu Hỏi': 'Number of questions',
  'Thời Gian / Câu': 'Time per question',
  'Tổng Thời Gian': 'Total time',
  'Tổng Cộng Đề Thi': 'Test total',
  'Nhận biết': 'Remember',
  'Thông hiểu': 'Understand',
  'Vận dụng': 'Apply',
  'Vận dụng cao': 'Apply (advanced)',
  'Nhận biết (Dễ)': 'Remember (easy)',
  'Thông hiểu (Trung bình)': 'Understand (medium)',
  'Vận dụng (Khó)': 'Apply (hard)',
  'Vận dụng cao (Rất khó)': 'Apply — advanced (very hard)',
  'Dễ': 'Easy',
  'Trung bình': 'Medium',
  'Khó': 'Hard',
  'Rất khó': 'Very hard',
  'Kiểm tra trí nhớ, định nghĩa, nhận diện trực tiếp':
    'Tests recall, definitions and direct recognition',
  'Giải thích bản chất, so sánh, chứng minh đơn giản':
    'Explains concepts, compares and proves simple statements',
  'Giải quyết bài toán qua 2-3 bước suy luận, tính toán':
    'Solves problems in 2-3 reasoning or calculation steps',
  'Tích hợp kiến thức sâu, giải quyết tình huống thực tế phức tạp':
    'Integrates deep knowledge to solve complex real-world situations',
  'Thời gian tùy chỉnh từng câu': 'Custom time per question',
  'Chỉnh định mức giây/câu': 'Adjust seconds per question',
  'Ẩn định mức': 'Hide the presets',
  'Khôi phục định mức mặc định': 'Restore the default presets',
  'Định mức mặc định lấy trung bình khoảng thời gian chuẩn cho học sinh THPT. Thầy/cô chỉnh lại nếu đề của mình nặng hoặc nhẹ hơn thông thường.':
    'The defaults use the standard average for high school students. Adjust them if your test is heavier or lighter than usual.',
  'Tổng thời gian = Số câu × Thời gian/câu': 'Total time = questions × time per question',
  'Tổng theo ma trận độ khó:': 'Total by difficulty matrix:',
  'Tính lại theo độ khó': 'Recalculate by difficulty',
  'Tự động tính': 'Auto-calculated',
  '20 giây': '20 seconds',
  '30 giây': '30 seconds',
  '45 giây': '45 seconds',
  '60 giây': '60 seconds',
  '90 giây': '90 seconds',
  '0 giây': '0 seconds',
  '2 phút': '2 minutes',
  '3 phút': '3 minutes',
  '5 phút': '5 minutes',
  'giây': 'seconds',
  'tiếng': 'h',
  'phút': 'minutes',
  'phút (': 'min (',
  'phút)': 'min)',
  'phút •': 'min •',
  's/câu)': 's/question)',
  'câu': 'questions',
  'câu):': 'questions):',
  'câu hỏi': 'questions',
  'Câu hỏi': 'Questions',
  'Câu': 'Question',
  'phút (theo ma trận độ khó)': 'min (from the difficulty matrix)',
  'phút (thầy/cô tự đặt)': 'min (set by you)',
  'p Chuẩn': 'min standard',
  'Khung {min}p Chuẩn': '{min}-min standard frame',
  'ƯỚC LƯỢNG THỜI GIAN': 'TIME ESTIMATE',
  'Biểu đồ thời gian làm bài chuẩn xác': 'Accurate working-time chart',

  // ---------- Essay setup ----------
  'Rà Soát Đề Bài Cho Trợ Lý AI': 'Review the prompt for the AI assistant',
  'Xác Nhận Nội Dung Trước Khi AI Phân Tích': 'Confirm the content before the AI analyses it',
  'Hệ thống AI sẽ dựa trên': 'The AI will use',
  'dưới đây để tính số phút và tự động sinh Khung Dàn Ý. Vui lòng rà soát lại trước khi sang Bước 3:':
    'below to compute the minutes and generate the outline. Please review it before moving to step 3:',
  ', tính toán số phút phù hợp cho từng bước và sinh khung dàn ý...':
    ', compute suitable minutes for each step and generate the outline...',
  'Yêu cầu chi tiết đề bài (Prompt bổ sung cho AI)': 'Detailed requirements (extra prompt for the AI)',
  'Ví dụ: Viết một bài văn nghị luận xã hội 500 từ về tư duy tự học và kỷ luật bản thân trong kỷ nguyên số...':
    'e.g. Write a 500-word argumentative essay on self-study and self-discipline in the digital age...',
  'Tự Động Sinh Thời Gian & Khung Dàn Ý Chi Tiết': 'Auto-generate the timing & detailed outline',
  'Phân Rã Bài Tập Bằng AI': 'Break the assignment down with AI',
  'Trợ Lý AI Đang Phân Tích Đề Bài & Lập Kế Hoạch...': 'The AI is analysing the prompt and planning...',
  'Đang đọc đề bài': 'Reading the prompt',
  'Phân tích & Xếp lịch': 'Analyse & schedule',
  'Bước thực hiện:': 'Steps:',
  'Bước:': 'Step:',
  'Thêm Bước Lập Kế Hoạch': 'Add a planning step',
  'Nhập tên bước...': 'Enter a step name...',
  'Lưu ý hướng dẫn...': 'Guidance note...',
  'LƯU Ý / HƯỚNG DẪN KÈM THEO (LU)': 'NOTES / GUIDANCE (LU)',
  'Khung Dàn Ý Gợi Ý (Outline)': 'Suggested outline',
  'Khung Dàn Ý Gợi Ý Chi Tiết (AI Outline)': 'Detailed suggested outline (AI)',
  'Thêm Mục Dàn Ý': 'Add an outline item',
  'Ví dụ: Mở bài - Dẫn dắt vấn đề và phát biểu luận điểm...':
    'e.g. Introduction — set up the issue and state the thesis...',
  'Chưa có dàn ý. Bấm "Phân Tích Bằng AI" để tự động sinh khung dàn ý.':
    'No outline yet. Click "Analyse with AI" to generate one.',
  'Các mốc định hướng bố cục giúp học sinh triển khai bài luận tuần tự & mạch lạc.':
    'These structural checkpoints help students build the essay step by step and coherently.',
  'Định hình các bước thực hiện, thời gian hoàn thành lý tưởng và lưu ý giúp học sinh làm bài độc lập không lo tràn LU.':
    'Shape the steps, ideal completion time and notes so students can work independently without LU overflow.',
  'Khung dàn ý hướng dẫn này sẽ được hiển thị chi tiết trên':
    'This outline will be shown in detail on',
  'để chỉ dẫn viết essay.': 'to guide the essay writing.',
  'Lưu ý phân bổ môn Ngoại Ngữ:': 'Note on foreign-language subjects:',
  'Đối với bài viết Tiếng Anh/Ngoại ngữ, thời gian thực hiện được tự động điều chỉnh tăng (~30%) để hỗ trợ học sinh tra cứu từ vựng chuyên ngành, rà soát cấu trúc ngữ pháp (grammar) và liên kết mạch đoạn (Coherence & Cohesion).':
    'For English or other foreign-language essays the time is automatically increased (~30%) so students can look up subject vocabulary, review grammar and work on coherence and cohesion.',
  '✨ Generate Lại Bằng AI': '✨ Regenerate with AI',
  'Tổng thời gian dự kiến:': 'Estimated total time:',
  'Tổng thời lượng': 'Total duration',
  'Đề xuất từ AI': 'AI suggestion',
  'Bài nhóm được cộng thêm': 'Group work adds',
  'phút họp phân công và': 'minutes for planning and',
  'phút tập duyệt cho mỗi thành viên.': 'minutes of rehearsal per member.',
  'Họp nhóm phân chia công việc và rà soát': 'Group meeting to split the work and review',
  'Thống nhất nội dung, phân vai và mốc thời gian': 'Agree on content, roles and milestones',
  'Tập duyệt trình bày sản phẩm cùng nhóm': 'Rehearse the presentation with the group',
  'Ghép phần các thành viên, xử lý chuyển tiếp': 'Merge each member’s part and smooth transitions',
  'Viết essay rèn luyện tự học': 'Essay practice for self-study skills',
  'Đặt lại về khung thời gian chuẩn': 'Reset to the standard time frame of',
  'của dạng bài này': 'for this assignment type',
  'Duyệt / Thông Qua Outline': 'Approve the outline',
  'Không Thông Qua': 'Do not approve',
  '⚪ Chưa Thông Qua Outline': '⚪ Outline not approved',
  '🟢 Đã Độc Quyền Duyệt Bởi Giáo Viên': '🟢 Approved by the teacher',
  'Học sinh sẽ chỉ nhận lịch giao các bước làm bài trên Workmap mà không xem khung dàn ý chi tiết.':
    'Students will only get the step schedule on the Workmap, without the detailed outline.',
  'Giáo viên lựa chọn không hiển thị khung dàn ý cho bài tập này. Học sinh tự do triển khai bài viết theo ý tưởng cá nhân.':
    'The teacher chose not to show an outline for this assignment. Students develop the piece their own way.',

  // Mục dàn ý mẫu
  '1. Chủ đề trung tâm của sơ đồ': '1. Central topic of the diagram',
  '2. Các nhánh chính (mỗi nhánh là một đơn vị kiến thức lớn)':
    '2. Main branches (each one a major knowledge unit)',
  '3. Nhánh phụ và từ khoá cho từng nhánh chính': '3. Sub-branches and keywords for each main branch',
  '4. Ví dụ hoặc công thức minh hoạ gắn với từng nhánh':
    '4. Examples or formulas illustrating each branch',
  '5. Liên kết ngang giữa các nhánh, chỉ ra mối quan hệ kiến thức':
    '5. Cross-links between branches showing how the knowledge relates',
  '1. Mở đầu: Giới thiệu chủ đề và thông điệp chính':
    '1. Opening: introduce the topic and the key message',
  '2. Bối cảnh và lý do chủ đề này đáng quan tâm': '2. Context and why the topic matters',
  '3. Nội dung trọng tâm 1 kèm dẫn chứng cụ thể': '3. Key point 1 with concrete evidence',
  '4. Nội dung trọng tâm 2 kèm số liệu hoặc ví dụ': '4. Key point 2 with data or examples',
  '5. Liên hệ thực tế với bản thân và lớp học': '5. Connect it to yourself and your class',
  '6. Kết luận và câu hỏi thảo luận cho người nghe':
    '6. Conclusion and a discussion question for the audience',
  '7. Bảng phân công: ai trình bày phần nào, thời lượng bao lâu':
    '7. Assignment table: who presents which part and for how long',
  '1. Tên biểu đồ & Tóm tắt mục tiêu thể hiện số liệu':
    '1. Chart title and a summary of what the data should show',
  '2. Bảng số liệu đã xử lý & đơn vị tính chính xác':
    '2. Processed data table with correct units',
  '3. Dạng biểu đồ lựa chọn (Cột, Đường, Tròn, Kết hợp...) & Lý do lựa chọn':
    '3. Chosen chart type (bar, line, pie, combined...) and why',
  '4. Nhận xét tổng quan: Đánh giá xu hướng chung, nhận xét khái quát':
    '4. Overall commentary: general trends and broad observations',
  '5. Nhận xét chi tiết: So sánh các mốc thời gian, đối tượng, giá trị cao/thấp nhất':
    '5. Detailed commentary: compare time points, subjects, highest and lowest values',
  '6. Giải thích nguyên nhân & Rút ra kết luận/dự báo':
    '6. Explain the causes and draw conclusions or forecasts',
  '1. Mục tiêu & Phạm vi thực hiện dự án': '1. Project goals and scope',
  '2. Kế hoạch phân công công việc & Tiến độ chi tiết':
    '2. Work assignment plan and detailed timeline',
  '3. Nội dung thu thập & Kết quả nghiên cứu thực tế':
    '3. Collected material and real research findings',
  '4. Tổng kết sản phẩm, bài học kinh nghiệm & Đánh giá kết quả':
    '4. Product summary, lessons learned and result assessment',
  'Mở bài: Dẫn dắt vấn đề và nêu nhận định chung về tầm quan trọng của ý thức tự học trong kỷ nguyên số.':
    'Introduction: set up the issue and state the importance of self-study in the digital age.',
  'Thân bài - Giải thích khái niệm: Thế nào là tự học và kỷ luật bản thân trong môi trường học tập hiện đại.':
    'Body — definitions: what self-study and self-discipline mean in a modern learning environment.',
  'Thân bài - Phân tích thực trạng: Chỉ ra những cơ hội học tập mở rộng cùng những thách thức lớn như sự xao nhãng.':
    'Body — current state: the widening learning opportunities and the big challenges such as distraction.',
  'Thân bài - Vai trò và ý nghĩa: Kỷ luật và tự học giúp học sinh tiếp thu tri thức chủ động, phát triển tư duy độc lập.':
    'Body — role and meaning: discipline and self-study let students absorb knowledge actively and think independently.',
  'Thân bài - Dẫn chứng & Phản đề: Đưa ra các ví dụ thực tế về gương tự học thành công và bài học vượt qua xao nhãng.':
    'Body — evidence and counter-argument: real examples of successful self-learners and lessons on beating distraction.',
  'Thân bài - Giải pháp hành động: Đề xuất các phương pháp rèn luyện cụ thể (quản lý thời gian Pomodoro, lập checklist).':
    'Body — action plan: concrete methods to practise (Pomodoro time management, checklists).',
  'Kết bài: Khẳng định lại ý nghĩa của tự học và kỷ luật trong việc định hình tương lai cá nhân; rút ra bài học nhận thức.':
    'Conclusion: restate the value of self-study and discipline in shaping your future, and the lesson learned.',

  // ---------- Ngân hàng câu hỏi ----------
  'Ngân Hàng Gói Câu Hỏi Đề Thi': 'Test question pack bank',
  'Kho dữ liệu gói câu hỏi riêng của giáo viên, nhập dữ liệu từ file CSV mẫu và lưu trữ trực tiếp trên hệ thống Supabase.':
    'Your own question pack storage: import from a sample CSV file and store it directly in Supabase.',
  'Kho riêng giáo viên': 'Teacher-only storage',
  'Tạo Gói Câu Hỏi': 'Create a question pack',
  'Tạo Gói Câu Hỏi Mới': 'Create a new question pack',
  'Tên Gói Câu Hỏi': 'Question pack name',
  'VD: Bộ 100 câu Trắc nghiệm Toán 10 - Chương 1': 'e.g. 100 maths questions, grade 10 — chapter 1',
  'Mô tả ngắn (Không bắt buộc)': 'Short description (optional)',
  'Nhập mô tả về nội dung gói câu hỏi...': 'Describe what the pack contains...',
  'Đang tạo gói...': 'Creating the pack...',
  'Đang tạo...': 'Creating...',
  'Tải Template CSV': 'Download the CSV template',
  'Tải Template CSV Mẫu': 'Download the sample CSV template',
  'Upload CSV ➔ Tự Tạo Gói Mới': 'Upload CSV ➔ auto-create a pack',
  'Đang đọc CSV...': 'Reading the CSV...',
  'Chưa có gói câu hỏi nào': 'No question packs yet',
  'Chưa có gói câu hỏi nào trong Ngân Hàng': 'The bank has no question packs yet',
  'Hãy bấm nút "Tạo Gói Câu Hỏi Mới" hoặc "Upload CSV ➔ Tự Tạo Gói Mới" ở trên.':
    'Use "Create a new question pack" or "Upload CSV ➔ auto-create a pack" above.',
  'Đang tải danh sách gói câu hỏi từ Supabase...': 'Loading question packs from Supabase...',
  'Đang tải danh sách câu hỏi trong gói...': 'Loading the questions in this pack...',
  'Đang tải danh sách câu hỏi...': 'Loading questions...',
  'Đang tải ngân hàng câu hỏi trắc nghiệm...': 'Loading the multiple-choice question bank...',
  'Quay lại danh sách gói': 'Back to the pack list',
  'Sửa Câu Hỏi Trong Gói': 'Edit a question in the pack',
  'Thêm Câu Hỏi Mới Vào Gói': 'Add a new question to the pack',
  'Thêm Câu Hỏi Mới': 'Add a new question',
  'Thêm Câu Hỏi Mới Cho Bài Tập': 'Add a new question to the assignment',
  'Thêm Câu Hỏi Thủ Công': 'Add a question manually',
  'Xóa Gói': 'Delete pack',
  'Xóa Gói Câu Hỏi Này?': 'Delete this question pack?',
  'Toàn bộ câu hỏi nằm trong gói này sẽ bị xóa khỏi Supabase.':
    'Every question in this pack will be removed from Supabase.',
  'Xóa gói câu hỏi này': 'Delete this question pack',
  'Đang xóa...': 'Deleting...',
  'Tổng số câu trong gói:': 'Questions in this pack:',
  'Mọi mức độ': 'All levels',
  'Tất cả': 'All',
  'Gói câu hỏi này chưa có dữ liệu ở mức độ đã chọn.':
    'This pack has no questions at the selected level.',
  'Lỗi tạo gói câu hỏi trên Supabase!': 'Failed to create the question pack in Supabase!',
  'Lỗi tạo gói câu hỏi mới trên Supabase!': 'Failed to create the new question pack in Supabase!',
  'Lỗi xóa gói câu hỏi!': 'Failed to delete the question pack!',
  'Lỗi lưu câu hỏi vào Supabase!': 'Failed to save the question to Supabase!',
  'Lỗi xóa câu hỏi!': 'Failed to delete the question!',
  'Bạn có chắc chắn muốn xóa câu hỏi này khỏi gói?':
    'Are you sure you want to remove this question from the pack?',
  'Bạn có chắc chắn muốn xóa câu hỏi này?': 'Are you sure you want to delete this question?',
  'File CSV trống hoặc không chứa dữ liệu câu hỏi!': 'The CSV file is empty or has no question data!',
  'Không tìm thấy câu hỏi hợp lệ nào trong file CSV!': 'No valid questions were found in the CSV file!',
  'Lỗi đọc file CSV:': 'Error reading the CSV file:',
  'Lỗi khi đọc file CSV. Vui lòng kiểm tra lại định dạng file!':
    'Error reading the CSV file. Please check its format!',
  'Không tải được ảnh lên, thử lại nhé.': 'The image could not be uploaded, please try again.',
  'Đang tải ảnh lên...': 'Uploading the image...',
  'Đang tải ảnh...': 'Loading the image...',
  'Tải ảnh lên cho đề bài': 'Upload an image for the question',
  'Ảnh minh họa': 'Illustration',
  'Ảnh minh họa câu hỏi': 'Question illustration',
  'Ảnh minh họa đề bài': 'Prompt illustration',
  'Đổi ảnh khác': 'Replace the image',
  'Gỡ ảnh': 'Remove the image',
  'PNG, JPG, WEBP — tối đa 5MB': 'PNG, JPG, WEBP — 5MB max',
  'Nội dung câu hỏi / Đề bài': 'Question content / prompt',
  'Nhập đề bài câu hỏi...': 'Enter the question prompt...',
  'Nhập nội dung đề bài...': 'Enter the prompt content...',
  'Đáp án A': 'Answer A',
  'Đáp án B': 'Answer B',
  'Đáp án C': 'Answer C',
  'Đáp án D': 'Answer D',
  'Lựa chọn A...': 'Option A...',
  'Lựa chọn B...': 'Option B...',
  'Lựa chọn C...': 'Option C...',
  'Lựa chọn D...': 'Option D...',
  'Đáp án ĐÚNG': 'CORRECT answer',
  'Đáp án chính xác:': 'Correct answer:',
  'Lời giải chi tiết': 'Detailed solution',
  'Lời giải chi tiết / Hướng dẫn': 'Detailed solution / guidance',
  'Lời giải:': 'Solution:',
  'Nhập hướng dẫn giải...': 'Enter the solution guidance...',
  'Giải thích lý do chọn đáp án đúng...': 'Explain why this answer is correct...',
  'Giải thích chi tiết:': 'Detailed explanation:',
  'Giải thích đáp án đúng:': 'Correct answer explained:',
  'Chi Tiết Đáp Án & Hướng Dẫn Giải:': 'Answer details & solution guide:',
  'Lưu Câu Hỏi': 'Save question',
  'Đang lưu...': 'Saving...',
  'Sửa': 'Edit',
  'Sửa câu hỏi': 'Edit question',
  'Sửa nội dung câu hỏi': 'Edit the question content',
  'Xóa': 'Delete',
  'XÓA': 'DELETE',
  'Xóa câu hỏi': 'Delete question',
  'Xóa câu hỏi này': 'Delete this question',
  'Hủy': 'Cancel',
  'Hủy Bỏ': 'Cancel',
  'Hủy bỏ': 'Cancel',
  'Đóng': 'Close',
  'Chọn': 'Select',
  'Mới': 'New',
  'Chi tiết': 'Details',
  'Lọc': 'Filter',
  'LỌC:': 'FILTER:',
  'Tải lại': 'Reload',
  'Danh Sách Câu Hỏi (': 'Question list (',
  'Quản Lý & Chỉnh Sửa Câu Hỏi (': 'Manage & edit questions (',
  'Quản lý & Chỉnh sửa câu hỏi': 'Manage & edit questions',
  'Biên Tập Nội Dung Câu Hỏi': 'Edit question content',
  'Giáo viên có toàn quyền chỉnh sửa, xóa, đổi tên, thêm/bớt và biên tập nội dung câu hỏi bài tập của mình.':
    'Teachers can freely edit, delete, rename, add, remove and rewrite the content of their own questions.',
  'Thêm, xóa, sửa nội dung đề bài, các lựa chọn đáp án và mức độ nhận thức.':
    'Add, delete and edit the prompt, answer options and cognitive level.',
  'Bài tập này chưa có câu hỏi nào. Bấm nút "Thêm Câu Hỏi Mới" ở trên để bổ sung.':
    'This assignment has no questions yet. Use "Add a new question" above.',
  'Bạn có thể bấm "Upload File CSV" hoặc "Thêm Câu Hỏi Thủ Công" để bổ sung.':
    'You can use "Upload CSV file" or "Add a question manually".',

  // ---------- Quản lý bài tập ----------
  'Quản Lý Bài Tập & Đề Thi Đã Giao': 'Manage assigned work & tests',
  'ExamLoad Radar • Toàn quyền chỉnh sửa đề thi cho Giáo viên bộ môn':
    'ExamLoad Radar • Full test editing rights for subject teachers',
  'ExamLoad Radar • Hệ thống tự động cân bằng tải cho Giáo viên & Học sinh':
    'ExamLoad Radar • Automatic load balancing for teachers and students',
  'Tìm kiếm bài tập...': 'Search assignments...',
  'Tìm tên bài tập...': 'Search by assignment name...',
  'Tất cả lớp': 'All classes',
  'Tất cả các lớp': 'All classes',
  'Tất cả môn học': 'All subjects',
  'Tất cả loại bài tập': 'All assignment types',
  'Tất cả trạng thái': 'All statuses',
  'Chưa có bài tập nào': 'No assignments yet',
  'Không tìm thấy bài tập nào': 'No assignments found',
  'Không có bài tập': 'No assignments',
  'Không có bài tập nào giao trong ngày này.': 'Nothing is assigned on this day.',
  'Không có bài tập nào phù hợp với bộ lọc đã chọn.': 'No assignments match the current filters.',
  'Bạn chưa giao bài tập nào cho lớp học đã chọn. Hãy chuyển sang mục "Tạo Bài Tập" để giao bài mới.':
    'You have not assigned anything to this class yet. Go to "Create assignment" to add one.',
  'Chỉnh Sửa Thông Tin Bài Tập': 'Edit assignment details',
  'Đổi tên & Sửa thông tin bài tập': 'Rename & edit the assignment',
  'Lưu Thay Đổi': 'Save changes',
  'Xóa Bài Tập': 'Delete assignment',
  'Xóa bài tập này': 'Delete this assignment',
  'Xác Nhận Xóa Bài Tập?': 'Delete this assignment?',
  'Bài tập này và toàn bộ dữ liệu phân bổ Workmap liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.':
    'This assignment and all related Workmap allocations will be permanently deleted.',
  'Lỗi cập nhật bài tập!': 'Failed to update the assignment!',
  'Lỗi xóa bài tập!': 'Failed to delete the assignment!',
  'Tổng bài tập được giao': 'Assignments given',
  'bài tập • Tổng thời gian:': 'assignments • total time:',
  'Bài tập': 'Assignment',
  'Môn': 'Subject',
  'Môn:': 'Subject:',
  'Môn học:': 'Subject:',
  'Môn & Bài (': 'Tasks (',
  'Ngày': 'Date',
  'Chưa xếp lịch': 'Not scheduled',
  '(Đang giao)': '(being assigned)',
  '(Bài tập đã có)': '(existing assignment)',
  '(Chưa chọn)': '(not selected)',
  '(không bắt buộc)': '(optional)',
  '(Lớp': '(Class',
  '(Đà Nẵng)': '(Da Nang)',
  'THPT Chuyên Lê Quý Đôn': 'Le Quy Don Gifted High School',
  'Nguyễn Văn Học': 'Nguyen Van Hoc',

  // Câu hỏi mẫu trong quản lý bài tập
  'Đáp án A: Đúng hoàn toàn': 'Answer A: completely correct',
  'Đáp án B: Sai một phần': 'Answer B: partly wrong',
  'Đáp án C: Chưa đủ dữ kiện': 'Answer C: not enough information',
  'Đáp án D: Tất cả đều sai': 'Answer D: all of the above are wrong',
  'Giải thích chi tiết: Lựa chọn A thỏa mãn đầy đủ các điều kiện lý thuyết.':
    'Detailed explanation: option A satisfies every theoretical condition.',
  'Phương án 1: Kết quả = 100': 'Option 1: result = 100',
  'Phương án 2: Kết quả = 250': 'Option 2: result = 250',
  'Phương án 3: Kết quả = 500': 'Option 3: result = 500',
  'Phương án 4: Kết quả = 1000': 'Option 4: result = 1000',
  'Giải thích chi tiết: Áp dụng công thức và tính ra giá trị 250.':
    'Detailed explanation: apply the formula to obtain 250.',

  // ---------- Workmap / quá tải ----------
  'Dự Báo Workmap & Tải Học Tập': 'Workmap & study load forecast',
  'Mô Phỏng Chia Workload Lên Workmap': 'Simulate the workload split on the Workmap',
  'Kế Hoạch Xếp Lịch Chi Tiết Trên Workmap': 'Detailed scheduling plan on the Workmap',
  'Chi Tiết Workmap & Lịch Phân Bổ Tải Học Tập': 'Workmap details & study-load allocation',
  'Chi Tiết Workmap & Tải LU': 'Workmap details & LU load',
  'Lịch Workmap Theo Dõi Tải Bài Tập (Lớp': 'Workmap schedule tracking assignment load (class',
  'Lịch Workmap Cá Nhân': 'Personal Workmap',
  'Lịch Workmap Bài Tập Tự Học Cá Nhân': 'Personal self-study Workmap',
  'Xem lịch Workmap': 'View the Workmap',
  'Mở rộng Workmap': 'Expand the Workmap',
  'Đóng Workmap': 'Close the Workmap',
  'Thu gọn lịch': 'Collapse the calendar',
  'thu gọn': 'collapse',
  'Xem nhiều ngày hơn (Cả tuần)': 'Show more days (full week)',
  'Gọn (1 ngày quá khứ)': 'Compact (1 past day)',
  '1 ngày qua': 'Last 1 day',
  '3 Ngày': '3 Days',
  '4 Ngày': '4 Days',
  '7 Ngày': '7 Days',
  '7 ngày tới': 'Next 7 days',
  '14 ngày tới': 'Next 14 days',
  '30 ngày tới': 'Next 30 days',
  'Khoảng thời gian:': 'Date range:',
  'Hôm nay': 'Today',
  'Tải:': 'LU:',
  'Tải học tập:': 'Study load:',
  'Tải công việc trong ngày:': 'Load for the day:',
  'TỔNG LU NGÀY': 'DAILY LU TOTAL',
  'Tổng LU ngày': 'Daily LU total',
  'Tổng tuần': 'Weekly total',
  'Tổng tải:': 'Total load:',
  'Tổng tải Workmap sau khi xếp chồng:': 'Total Workmap load after stacking:',
  '1 LU = 30 phút': '1 LU = 30 minutes',
  'Chuẩn quy đổi:': 'Conversion standard:',
  'Hệ thống tự động tính:': 'Calculated automatically:',
  '5.0 LU/ngày': '5.0 LU/day',
  '(Tối đa 5.0 LU/ngày)': '(max 5.0 LU/day)',
  'Không giới hạn': 'No limit',
  'An toàn': 'Safe',
  'An toàn (<3.5 LU)': 'Safe (<3.5 LU)',
  'Vừa': 'Moderate',
  'Vừa phải': 'Moderate',
  'Vừa phải (3.5-5 LU)': 'Moderate (3.5-5 LU)',
  'Quá tải': 'Overloaded',
  'Quá Tải': 'Overloaded',
  'Quá tải (>5 LU)': 'Overloaded (>5 LU)',
  'Cân đối': 'Balanced',
  'Lệch tỷ lệ': 'Unbalanced',
  'Vượt': 'Over',
  'Vượt quỹ nhóm môn': 'Over the subject-group budget',
  '— quỹ tuần': '— weekly budget',
  'Tuần còn nhẹ': 'The week is still light',
  'Tải An Toàn': 'Safe load',
  'Tải Vừa Phải': 'Moderate load',
  '🟢 Workload An toàn': '🟢 Safe workload',
  '🟡 Tải cao (3.5-5.0 LU)': '🟡 High load (3.5-5.0 LU)',
  '🔴 Quá tải (>5.0 LU)': '🔴 Overloaded (>5.0 LU)',
  'Phân Bổ Workload Rất Cân Bằng & Tối Ưu!': 'The workload is well balanced and optimal!',
  'Bài tập được xếp đều vào các ngày có tải nhẹ, giúp học sinh duy trì sức bền và học tập hiệu quả.':
    'Work is spread across lighter days so students keep their stamina and study effectively.',
  'Workload Khá Cao - Cần Lưu Ý Hạn Nộp': 'Fairly high workload — mind the due date',
  'Tải học tập đạt xấp xỉ 3.5 - 5.0 LU/ngày. Học sinh sẽ cần tập trung nhưng vẫn nằm trong phạm vi cho phép.':
    'The load is around 3.5 - 5.0 LU/day. Students will need to focus, but it stays within the allowed range.',
  'Cảnh Báo Quá Tải': 'Overload warning',
  'Cảnh Báo Quá Tải Workmap Cho Lớp Học!': 'Workmap overload warning for this class!',
  'Phát Hiện Quá Tải': 'Overload detected',
  'Phân bổ bài tập này sẽ làm tổng tải học tập vượt ngưỡng 5.0 LU (150 phút/ngày) vào một số ngày. Vui lòng chọn giải pháp bên dưới.':
    'Scheduling this assignment pushes the total load above 5.0 LU (150 minutes/day) on some days. Please choose an option below.',
  'Thêm bài tập này sẽ dẫn đến': 'Adding this assignment will cause',
  'phút so với ngưỡng 5 LU/ngày': 'minutes above the 5 LU/day threshold',
  'Danh Sách Bài Tập Xếp Chồng Trong Ngày (': 'Assignments stacked on this day (',
  'Quy Trình Xử Lý Quá Tải Workmap (ExamLoad Workflow)': 'Workmap overload workflow (ExamLoad)',
  '1. Dời Hạn Nộp Sang Ngày Tải Nhẹ': '1. Move the due date to a lighter day',
  '2. Chuyển Hình Thức Làm Nhóm': '2. Switch to group work',
  'Đổi Hạn Nộp Sang': 'Move the due date to',
  'Dời hạn nộp sang': 'Move the due date to',
  'Tự động gia hạn nộp đến': 'Automatically extend the due date to',
  'Chuyển Sang Làm Nhóm (Giảm 50% LU)': 'Switch to group work (50% less LU)',
  'Chuyển sang nhóm 3-4 học sinh giúp chia sẻ công việc, giảm 50% thời lượng cần thiết của từng em.':
    'Groups of 3-4 students share the work and cut each student’s time in half.',
  'Giảm 50% LU': '50% less LU',
  '✓ Đã Bật Làm Nhóm (Đã giảm 50% LU)': '✓ Group work enabled (LU halved)',
  'Áp Dụng Đề Xuất': 'Apply the suggestion',
  'Xếp Lại Theo Gợi Ý AI': 'Reschedule with the AI suggestion',
  'AI đã gộp các bước liên quan vào cùng ngày và né ngày lớp đã kín tải. Thầy/cô đổi trực tiếp ngày của từng bước ở cột bên phải.':
    'The AI grouped related steps on the same day and avoided days the class is already full. You can change each step’s date in the right-hand column.',
  'Dạng bài chia nhỏ (Decomposable): Đã tự động phân rải các bước qua các ngày thấp tải.':
    'Decomposable type: the steps were automatically spread across lower-load days.',
  'Dạng bài nguyên khối (Atomic): Bạn nên dời hạn nộp hoặc chuyển sang làm nhóm.':
    'Atomic type: you should move the due date or switch to group work.',
  'Cân Đối Tỷ Lệ Tự Nhiên / Xã Hội Trong Tuần': 'Balance the science / humanities ratio this week',
  'LU cho nhóm môn chính,': 'LU for the main subject group,',
  'LU cho nhóm còn lại.': 'LU for the other group.',
  'Số môn giao:': 'Subjects assigned:',
  'Số lớp bị ảnh hưởng': 'Classes affected',
  'Quay Lại Điều Chỉnh': 'Back to adjust',
  'Xác Nhận Ghi Đè & Giao Bài': 'Confirm the override & assign',
  'Ghi Đè & Lưu Audit Log': 'Override & save the audit log',
  'Ghi Đè Cảnh Báo & Lưu Audit Log': 'Override the warning & save the audit log',
  'Ép Giao (Force Assign)': 'Force assign',
  'Bắt Buộc Giao Bài (Cần Ghi Đè)': 'Assignment required (override needed)',
  'Vẫn giao được nhưng bắt buộc ghi lý do ghi đè và lưu audit log gửi nhà trường.':
    'You can still assign it, but you must record a reason and send an audit log to the school.',
  'Tại sao bắt buộc phải giao vào ngày này dù đã quá tải?':
    'Why must this be assigned on an already-overloaded day?',
  'Vui lòng chọn hoặc nhập lý do ghi đè (Lưu nhật ký hệ thống):':
    'Choose or enter an override reason (saved to the system log):',
  'Lý do ép buộc giao (Override)': 'Override reason',
  'Lý do giáo viên nêu:': 'Reason given by the teacher:',
  'Nhập lý do ghi đè chi tiết...': 'Enter a detailed override reason...',
  'Khác (nhập chi tiết bên dưới)': 'Other (describe below)',
  'Bài kiểm tra trọng tâm bắt buộc theo kế hoạch bộ môn':
    'A required key test set by the subject plan',
  'Lớp học đã được chuẩn bị bài trước từ tuần trước': 'The class prepared for this last week',
  'Đã thỏa thuận và thống nhất khối lượng làm việc với học sinh':
    'The workload was agreed with the students',
  'Xác nhận giao bài dù có cảnh báo từ hệ thống.':
    'Confirm the assignment despite the system warning.',
  'Xác nhận giao bài dù tải công việc vượt 5.0 LU/ngày.':
    'Confirm the assignment even though the load exceeds 5.0 LU/day.',
  'Chiến lược:': 'Strategy:',
  'Khuyên dùng': 'Recommended',
  'để hạ mức tải học sinh về an toàn.': 'to bring the student load back to a safe level.',
  'Phân Bổ Tiến Trình:': 'Progress allocation:',
  'Bấm vào bài tập để': 'Click an assignment to',
  'xem lịch chi tiết': 'see the detailed schedule',
  '• Nhấn để': '• Click to',
  '• Làm chung ngày với bước': '• Same day as step',
  '• Môn': '• Subject',
  '📌 Môn': '📌 Subject',
  '• Hệ Thống Bài Tập': '• Assignment system',
  '• Học kỳ I': '• Term I',
  'và': 'and',
  'hoặc': 'or',
  'vào ngày': 'on',
  'Ghi lúc': 'Logged at',
  '+1 ngày': '+1 day',
  '+3 ngày': '+3 days',
  '+1 tuần': '+1 week',

  // ---------- Bảng điều khiển nhà trường (admin) ----------
  'Bảng Điều Khiển Nhà Trường': 'School dashboard',
  'Giám sát các trường hợp giáo viên ghi đè cảnh báo quá tải học sinh':
    'Monitor cases where teachers override student overload warnings',
  'Tổng lượt ghi đè': 'Total overrides',
  'Mức nghiêm trọng': 'Severity',
  'Nghiêm trọng': 'Critical',
  'Nhẹ': 'Minor',
  'Vượt trên 30 phút hoặc giao gấp sau 19:00':
    'More than 30 minutes over, or assigned urgently after 19:00',
  'Lọc theo lớp:': 'Filter by class:',
  'Đang tải nhật ký...': 'Loading the log...',
  'Chưa có lượt ghi đè nào': 'No overrides yet',
  'Chưa giáo viên nào phải ghi đè cảnh báo quá tải. Đây là dấu hiệu tốt.':
    'No teacher has had to override an overload warning. That is a good sign.',
  'Không có bản ghi nào khớp bộ lọc đã chọn.': 'No records match the current filters.',
  'Giáo viên': 'Teacher',
  'Học sinh': 'Student',

  // ---------- Học sinh ----------
  'Workmap & Task của Học Sinh': 'Student Workmap & tasks',
  'Hồ Sơ Học Sinh': 'Student profile',
  'Hồ sơ học sinh': 'Student profile',
  'Hồ Sơ Học Sinh Lần Đầu': 'First-time student profile',
  'Chỉnh Sửa Hồ Sơ & Đổi Lớp Học': 'Edit profile & change class',
  'Bấm để chỉnh sửa hồ sơ & đổi lớp học': 'Click to edit your profile and change class',
  'Cá nhân hóa theo Lớp học & Trường': 'Personalised by class and school',
  'Chân Dung Avatar 3D:': '3D avatar:',
  'Họ và Tên Học Sinh:': "Student's full name:",
  'Lớp Học (Ví dụ: 10A5, 10A1, 11B2, 12A5):': 'Class (e.g. 10A5, 10A1, 11B2, 12A5):',
  'Trường Học:': 'School:',
  'Tỉnh / Thành Phố:': 'Province / City:',
  'Ví dụ: 10A5, 11B2, 12/1': 'e.g. 10A5, 11B2, 12/1',
  'Lưu Hồ Sơ': 'Save profile',
  'Vui lòng nhập lớp học.': 'Please enter your class.',
  'Vui lòng nhập họ và tên.': 'Please enter your full name.',
  'Vui lòng nhập trường học.': 'Please enter your school.',
  'Vui lòng nhập tỉnh / thành phố.': 'Please enter your province or city.',
  'Định dạng lớp chưa hợp lệ! Ví dụ: 10A5, 11B2, 12/1':
    'Invalid class format! For example: 10A5, 11B2, 12/1',
  'Định dạng lớp không đúng! Hãy điền dạng 10Ax, 10Bx, 10Cx, 10Dx hoặc 10/x (VD: 10A5, 11B2, 12/1)':
    'Invalid class format! Use 10Ax, 10Bx, 10Cx, 10Dx or 10/x (e.g. 10A5, 11B2, 12/1)',
  'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.':
    'Your session has expired. Please sign in again.',
  'Không thể lưu hồ sơ. Vui lòng thử lại.': 'Could not save the profile. Please try again.',
  'Nữ sinh 1': 'Schoolgirl 1',
  'Nữ sinh 2': 'Schoolgirl 2',
  'Năng nổ': 'Energetic',
  'Sáng tạo': 'Creative',
  'Vui vẻ': 'Cheerful',
  'Danh Sách Bài Tập & Giao Diện Làm Bài': 'Assignment list & workspace',
  'Làm Bài & Bài Tập': 'Assignments & practice',
  'Lựa chọn bài tập để tiến hành làm trắc nghiệm Quiz trực tiếp hoặc xem dàn ý chi tiết bài luận Essay do Giáo viên đã phê duyệt.':
    'Pick an assignment to take the quiz online or read the essay outline approved by your teacher.',
  'Xem toàn bộ môn học, bài tập được giao và theo dõi chỉ số tải LU theo từng ngày.':
    'See every subject and assignment, and track your daily LU load.',
  'Xem lịch nộp bài tập, làm bài trực tuyến, phân tích lộ trình học tập cá nhân và xem mức độ áp lực ExamLoad của lớp.':
    'Check due dates, work online, review your study path and see your class’s ExamLoad pressure.',
  'Theo dõi môn học, tiến độ và tải học tập (LU). Giới hạn tối đa':
    'Track subjects, progress and study load (LU). Maximum limit',
  'Làm bài Trắc nghiệm Quiz': 'Take the quiz',
  'Vào làm ngay': 'Start now',
  'Vào làm ngay ➔': 'Start now ➔',
  'Xem Dàn Ý Essay': 'View the essay outline',
  'Xem Khung Dàn Ý (Outline) Bài Luận': 'View the essay outline',
  'Xem dàn ý ➔': 'View the outline ➔',
  'do Giáo viên đã duyệt.': 'approved by the teacher.',
  '⏳ Chưa làm bài': '⏳ Not started',
  '✅ Đã làm bài': '✅ Completed',
  '🎯 Đã làm bài': '🎯 Completed',
  '🎯 Đã hoàn thành': '🎯 Completed',
  'Kết Quả Bài Trắc Nghiệm': 'Quiz results',
  'Nộp Bài Trắc Nghiệm': 'Submit the quiz',
  'Làm lại Quiz': 'Retake the quiz',
  'Câu Trước': 'Previous question',
  'Câu Tiếp': 'Next question',
  'CÂU ĐÚNG (': 'CORRECT (',
  '✓ Đúng': '✓ Correct',
  'Lựa chọn của em:': 'Your answer:',
  'Đã trả lời:': 'Answered:',
  'Đã duyệt:': 'Approved:',
  'Chưa duyệt:': 'Not approved:',
  'THỜI GIAN:': 'TIME:',
  'Đang xử lý...': 'Processing...',
  'Đã Hoàn Thành & Tự Động Ghi Nhận Kết Quả Học Tập':
    'Completed — your result was recorded automatically',
  'Tiến Trình Thực Hiện Tự Học (Giáo Viên Đã Phân Bổ)':
    'Self-study progress (allocated by the teacher)',
  'Nội Dung Chi Tiết': 'Full details',
  'Tích chọn từng mục dàn ý khi em đã triển khai xong đoạn văn tương ứng trong bài essay:':
    'Tick each outline item once you have written the matching paragraph:',
  'Chưa có dàn ý chi tiết trong cơ sở dữ liệu cho bài tập này.':
    'There is no detailed outline in the database for this assignment.',
  'Chưa có thông tin phân bổ tiến trình thực hiện cho bài tập này trong cơ sở dữ liệu.':
    'There is no progress allocation for this assignment in the database.',
  'Hệ thống trực tuyến': 'System online',
  'Radar cảnh báo quá tải học sinh': 'Student overload warning radar',
  'Phân quyền thông minh,': 'Smart permissions,',
  'Tối ưu giảng dạy.': 'optimised teaching.',
  'Tạo và quản lý bài tập, ngân hàng câu hỏi, kiểm soát ma trận đề thi và theo dõi khối lượng học tập (ExamLoad) của các lớp.':
    'Create and manage assignments and question banks, control the test matrix and track each class’s ExamLoad.',

  // Câu hỏi quiz mẫu cho học sinh
  'Tư duy tự học đóng vai trò gì quan trọng nhất trong thời đại công nghệ số?':
    'What is the most important role of a self-study mindset in the digital age?',
  'A. Giúp học sinh chủ động tìm kiếm kiến thức và rèn kỹ năng tự nghiên cứu':
    'A. It lets students seek knowledge actively and build research skills',
  'B. Giảm bớt số lượng giáo viên giảng dạy trên lớp':
    'B. It reduces the number of teachers needed in class',
  'C. Giúp học sinh hoàn thành bài tập nhanh hơn mà không cần suy nghĩ':
    'C. It lets students finish work faster without thinking',
  'D. Thay thế hoàn toàn các kỳ thi đánh giá học lực':
    'D. It completely replaces academic assessment exams',
  'Tự học là năng lực cốt lõi giúp người học chủ động cập nhật tri thức trong kỷ nguyên số.':
    'Self-study is the core ability that lets learners keep their knowledge current in the digital era.',
  'Phương pháp Pomodoro khuyên chúng ta nên tập trung trong bao lâu trước khi nghỉ giải lao?':
    'How long does the Pomodoro technique suggest you focus before taking a break?',
  'A. 15 phút tập trung, nghỉ 10 phút': 'A. 15 minutes of focus, 10 minutes of rest',
  'B. 25 phút tập trung, nghỉ 5 phút': 'B. 25 minutes of focus, 5 minutes of rest',
  'C. 45 phút tập trung, nghỉ 15 phút': 'C. 45 minutes of focus, 15 minutes of rest',
  'D. 60 phút tập trung, nghỉ 20 phút': 'D. 60 minutes of focus, 20 minutes of rest',
  'Chu kỳ Pomodoro tiêu chuẩn là 25 phút làm việc tập trung cao độ kết hợp 5 phút nghỉ ngắn.':
    'A standard Pomodoro cycle is 25 minutes of deep focus plus a 5-minute break.',
  'Đâu là thói quen xấu ảnh hưởng tiêu cực nhất đến sự tập trung khi học tập?':
    'Which bad habit hurts study concentration the most?',
  'A. Chuẩn bị không gian học thoáng mát': 'A. Preparing an airy study space',
  'B. Đặt mục tiêu học tập rõ ràng cho mỗi buổi học':
    'B. Setting clear goals for each study session',
  'C. Để thông báo mạng xã hội liên tục bật bên cạnh':
    'C. Leaving social media notifications on beside you',
  'D. Ghi chú bài học bằng sơ đồ tư duy': 'D. Taking notes with mind maps',
  'Thông báo điện thoại liên tục gây ngắt quãng luồng tư duy (Focus Flow).':
    'Constant phone notifications keep breaking your focus flow.',

  // ---------- Câu cảnh báo do engine sinh (mẫu có chỗ trống {…}) ----------
  'Nhóm môn {group} đã dùng {used}/{quota} LU (quỹ {percent}% của {cap} LU tuần), vượt {excess} LU so với tỷ lệ 70/30 của lớp ban {orientation}.':
    'The {group} subject group has used {used}/{quota} LU ({percent}% of the {cap} LU weekly budget), {excess} LU beyond the 70/30 split for a {orientation} class.',
  'Tuần đã có {total}/{cap} LU và nhóm môn {group} đang chiếm {ratio}%, lệch khỏi tỷ lệ 70/30 của lớp ban {orientation}. Nên cân nhắc dời bớt sang nhóm môn còn lại.':
    'The week already holds {total}/{cap} LU and the {group} subject group takes {ratio}% of it, off the 70/30 split for a {orientation} class. Consider moving some of it to the other group.',
  'Tuần mới có {total}/{cap} LU — chưa đủ tải để đánh giá tỷ lệ 70/30. Hệ thống chỉ theo dõi, chưa cảnh báo.':
    'The week holds only {total}/{cap} LU so far — not enough load to judge the 70/30 split. The system is tracking it without warning.',
  'Tổng tải tuần {total} LU đã vượt ngưỡng khuyến nghị {cap} LU.':
    'The weekly total of {total} LU is already past the recommended {cap} LU ceiling.',
  'Bài được giao sau {hour}:00 nên hôm nay ({today}) không còn là ngày làm bài hợp lệ, mà hạn nộp lại là {deadline}. Học sinh không còn ngày nào để làm bài.':
    'Assigned after {hour}:00, so today ({today}) is no longer a valid working day, yet the deadline is {deadline}. Students have no day left to work on it.',
  'Bài được giao sau {hour}:00 nên hôm nay ({today}) đã hết quỹ thời gian tự học. Lịch làm bài bắt đầu từ {start}.':
    "Assigned after {hour}:00, so today's ({today}) self-study budget is used up. Work is scheduled from {start}.",
  'Hạn nộp {deadline} sớm hơn ngày bắt đầu làm bài {start}.':
    'The {deadline} deadline falls before the {start} start date.',
  'Giao Bài Quá Gấp Sau': 'Assigned far too late, after',
  'Giao Bài Sau 19:00 - Lịch Bắt Đầu Từ Ngày Mai':
    'Assigned after 19:00 — scheduling starts tomorrow',
  'Tự nhiên (nhóm chính)': 'Science (main group)',
  'Xã hội (nhóm chính)': 'Humanities (main group)',
  'Tự nhiên (nhóm phụ)': 'Science (secondary group)',
  'Xã hội (nhóm phụ)': 'Humanities (secondary group)',
  'Bài tập khác': 'Other assignment',

  // ---------- Dạng bài (task-templates) ----------
  'Trắc nghiệm (nguyên khối)': 'Multiple choice (atomic)',
  'Tự luận (nguyên khối)': 'Written answer (atomic)',
  'Vẽ biểu đồ': 'Draw a chart',
  'Sơ đồ tư duy (1-2 bài)': 'Mind map (1-2 lessons)',
  'Sơ đồ tư duy (cả chương)': 'Mind map (whole chapter)',
  'Thuyết trình cá nhân': 'Individual presentation',
  'Thuyết trình nhóm': 'Group presentation',
  'Dự án': 'Project',
  'Bước': 'Step',

  // Bước mẫu — sơ đồ tư duy
  'Đọc lại bài/chương và xem vở ghi': 'Re-read the lesson/chapter and review your notes',
  'Đọc lại toàn bộ chương và hệ thống vở ghi':
    'Re-read the whole chapter and organise your notes',
  'Chọn lọc thông tin, rút ý chính': 'Select the information and extract the key ideas',
  'Chọn lọc thông tin, rút ý chính từng bài':
    'Select the information and extract the key ideas of each lesson',
  'Chia nhánh và sắp xếp theo cấu trúc': 'Split into branches and arrange the structure',
  'Chia nhánh và sắp xếp cấu trúc tổng thể': 'Split into branches and arrange the overall structure',
  'Vẽ sơ đồ tư duy': 'Draw the mind map',
  'Vẽ sơ đồ tư duy hoàn chỉnh': 'Draw the complete mind map',
  'Kiểm tra lại': 'Check it over',
  'Rà soát, bổ sung liên kết giữa các nhánh': 'Review and add links between the branches',

  // Bước mẫu — thuyết trình
  'Đọc hiểu đề, xác định phạm vi và mục tiêu trình bày':
    'Read the prompt and define the scope and goal of the talk',
  'Tra cứu tài liệu và chọn lọc dẫn chứng': 'Research sources and select evidence',
  'Xây dựng dàn ý và nội dung slide': 'Build the outline and slide content',
  'Thiết kế slide và hình ảnh minh hoạ': 'Design the slides and illustrations',
  'Tổng hợp nguồn tham khảo': 'Compile the reference list',
  'Luyện nói và bấm giờ phần trình bày': 'Rehearse aloud and time the talk',

  // Bước mẫu — biểu đồ
  'Đọc bảng số liệu, xác định dạng biểu đồ': 'Read the data table and pick the chart type',
  'Xử lý số liệu và tính tỉ lệ': 'Process the data and compute the ratios',
  'Nhận xét xu hướng': 'Comment on the trend',
  'Kiểm tra chú thích, đơn vị, tên biểu đồ': 'Check the legend, units and chart title',
  'Đọc hiểu số liệu và xác định mục tiêu biểu đồ':
    'Read the data and define what the chart must show',
  'Nắm rõ bộ số liệu và các chỉ số cần thể hiện':
    'Understand the dataset and the figures to present',
  'Xử lý, tính toán số liệu và phân loại dữ liệu': 'Process, compute and classify the data',
  'Tính toán tỷ lệ %, xử lý chênh lệch số liệu': 'Compute percentages and handle the differences',
  'Lựa chọn dạng biểu đồ thích hợp và dựng khung/trục':
    'Choose a suitable chart type and set up the frame and axes',
  'Xác định dạng cột, đường, tròn hoặc kết hợp': 'Decide between bar, line, pie or combined',
  'Vẽ biểu đồ chi tiết và điền chú giải': 'Draw the chart in detail and add the legend',
  'Vẽ chính xác tỷ lệ, điền đầy đủ chú giải và đơn vị':
    'Draw to scale and fill in the full legend and units',
  'Nhận xét, phân tích xu hướng và rút ra kết luận':
    'Comment, analyse the trend and draw conclusions',
  'Phân tích điểm nổi bật, nhận xét khái quát & chi tiết':
    'Analyse the highlights with both general and detailed commentary',
  'Rà soát, kiểm tra độ chính xác và hoàn thiện': 'Review, check the accuracy and finish',
  'Kiểm tra khớp số liệu và tên biểu đồ': 'Check that the data and chart title match',

  // Bước mẫu — essay
  'Đọc hiểu đề và xác định phạm vi nội dung': 'Read the prompt and define the content scope',
  'Đọc kỹ yêu cầu đề, xác định phạm vi nội dung':
    'Read the requirements carefully and define the scope',
  'Đọc kỹ prompt, xác định yêu cầu từ vựng & cấu trúc ngữ pháp':
    'Read the prompt carefully and identify the vocabulary and grammar needed',
  'Tra cứu thông tin và kiểm tra tính xác thực': 'Research and verify the information',
  'Tra cứu thông tin và kiểm tra lại tính xác thực': 'Research and double-check the information',
  'Tìm kiếm các tài liệu, nguồn thông tin uy tín': 'Find reliable sources and references',
  'Tra cứu các từ vựng chuyên ngành & bài mẫu': 'Look up subject vocabulary and sample essays',
  'Xác định từ khoá, ý chính và luận điểm': 'Identify keywords, main ideas and arguments',
  'Xác định từ khóa/ý chính và luận điểm': 'Identify keywords, main ideas and arguments',
  'Đúc rút các luận điểm cốt lõi': 'Distil the core arguments',
  'Xác định Thesis Statement & Topic Sentences': 'Define the thesis statement and topic sentences',
  'Lập dàn ý chi tiết': 'Build a detailed outline',
  'Xây dựng khung bài viết gồm Mở - Thân - Kết':
    'Build the structure: introduction, body, conclusion',
  'Viết essay': 'Write the essay',
  'Viết essay (Chú ý Coherence & Transition Words)':
    'Write the essay (mind coherence and transition words)',
  'Tập trung viết mạch lạc, liên kết ý tốt': 'Focus on flow and well-connected ideas',
  'Tập trung viết câu phức, kiểm tra liên kết giữa các đoạn văn':
    'Focus on complex sentences and check the links between paragraphs',
  'Đọc lại, chỉnh sửa và hoàn thiện': 'Re-read, revise and finish',
  'Đọc lại bài, chỉnh sửa, kiểm tra lỗi và hoàn thiện':
    'Re-read, revise, proofread and finish',
  'Rà soát Grammarly/Lỗi chính tả & Từ vựng': 'Proofread spelling, grammar and vocabulary',
  'Chỉnh sửa lỗi chính tả, câu chữ, diễn đạt': 'Fix spelling, wording and expression',
  'Chỉnh sửa lỗi thì (tenses), hòa hợp chủ vị & spelling':
    'Fix tenses, subject-verb agreement and spelling',
  'Tổng hợp tài liệu tham khảo': 'Compile the references',
  'Tổng hợp lại các tài liệu tham khảo (Trình bày link)':
    'Compile the references (with links)',
  'Liệt kê danh mục tài liệu tham khảo theo đúng chuẩn':
    'List the references in the correct format',

  // Bước mẫu — dự án
  'Lên kế hoạch dự án và phân công mục tiêu': 'Plan the project and assign the goals',
  'Xác định phạm vi, vai trò thành viên và mốc hoàn thành':
    'Define the scope, member roles and milestones',
  'Thu thập dữ liệu và tài liệu nghiên cứu': 'Collect data and research material',
  'Khảo sát, thu thập thông tin và tổng hợp tư liệu':
    'Survey, gather information and compile the material',
  'Thực hiện và tổng hợp sản phẩm': 'Build and assemble the product',
  'Thực hiện và tổng hợp sản phẩm dự án': 'Build and assemble the project deliverable',
  'Xây dựng nội dung, mô hình hoặc bài báo cáo': 'Build the content, model or report',
  'Hoàn thiện và chuẩn bị báo cáo': 'Finalise and prepare the report',
  'Đánh giá, hoàn thiện và chuẩn bị báo cáo/thuyết trình':
    'Assess, finalise and prepare the report or presentation',
  'Tổng duyệt sản phẩm và tập luyện thuyết trình':
    'Do a full review of the product and rehearse the talk',

  // Ghi chú bước
  'Nắm lại toàn bộ nội dung cần hệ thống hoá': 'Re-absorb all the content to be organised',
  'Gạch chân từ khoá, loại bỏ chi tiết phụ': 'Underline keywords and drop minor details',
  'Xác định nhánh chính, nhánh phụ và thứ bậc':
    'Identify main branches, sub-branches and hierarchy',
  'Trình bày bằng màu sắc, hình khối dễ ghi nhớ':
    'Use colour and shapes that are easy to remember',
  'Đối chiếu với sách giáo khoa xem đã đủ ý chưa':
    'Check against the textbook that nothing is missing',
  'Xác định thông điệp chính muốn người nghe nhớ':
    'Decide the key message the audience should remember',
  'Ưu tiên số liệu, ví dụ thực tế thuyết phục':
    'Prefer data and convincing real-world examples',
  'Mỗi slide một ý, tránh chép nguyên đoạn văn':
    'One idea per slide; do not paste whole paragraphs',
  'Chú ý cỡ chữ, tương phản màu để nhìn rõ từ xa':
    'Mind font size and colour contrast so it reads from a distance',
  'Ghi rõ nguồn cho mọi số liệu và hình ảnh': 'Cite the source of every figure and image',
  'Tập nói thành tiếng, canh đúng thời lượng cho phép':
    'Rehearse out loud and keep to the allotted time',
  'Bài tập rèn luyện tư học và kỹ năng': 'Self-study and skills practice assignment',

  // Dàn ý sinh tự động — phần cố định quanh tên bài
  'Mở bài: Dẫn dắt vấn đề về': 'Introduction: set up the issue of',
  'và nêu nhận định chung định hướng.': 'and state the guiding proposition.',
  'Thân bài - Giải thích khái niệm: Làm rõ bản chất và phạm vi của bài viết.':
    'Body — definitions: clarify the nature and scope of the piece.',
  'Thân bài - Phân tích thực trạng: Chỉ ra cơ hội và thách thức thực tế.':
    'Body — current state: point out the real opportunities and challenges.',
  'Thân bài - Vai trò và ý nghĩa: Đánh giá tác động đến cá nhân và cộng đồng.':
    'Body — role and meaning: assess the impact on the individual and the community.',
  'Thân bài - Dẫn chứng minh họa: Đưa ra ví dụ cụ thể, thuyết phục.':
    'Body — evidence: give concrete, convincing examples.',
  'Thân bài - Đề xuất giải pháp / Phản đề: Các bước hành động rèn luyện cụ thể.':
    'Body — solutions / counter-argument: concrete steps to practise.',
  'Kết bài: Khẳng định lại tầm quan trọng và bài học nhận thức bản thân.':
    'Conclusion: restate the importance and the personal lesson learned.',
  '1. Tên biểu đồ:': '1. Chart title:',
  '- Tóm tắt mục tiêu thể hiện số liệu': '— summary of what the data should show',
  '6. Giải thích nguyên nhân & Rút ra kết luận / dự báo':
    '6. Explain the causes and draw conclusions or forecasts',
  '1. Mục tiêu & Phạm vi thực hiện dự án:': '1. Project goals and scope:',
  '1. Chủ đề trung tâm:': '1. Central topic:',
  '1. Mở đầu: Giới thiệu chủ đề': '1. Opening: introduce the topic',
  'và thông điệp chính': 'and the key message',
  'Dự báo học sinh làm bài bằng Tiếng Anh: Tăng thêm ~30% thời gian cho khâu chọn từ vựng, kiểm tra ngữ pháp và liên kết đoạn.':
    'Expected to be written in English: ~30% more time is allowed for vocabulary choice, grammar checking and paragraph linking.',
  'Phân bổ thời gian chuẩn bám sát khung năng lực THPT.':
    'Standard time allocation aligned with the high school competency framework.',
  'Bài Tiếng Anh thêm thời gian từ vựng & ngữ pháp.':
    'English assignments get extra time for vocabulary and grammar.',
  'Thời gian phân bổ theo chuẩn năng lực THPT.':
    'Time allocated to the high school competency standard.',

  // ---------- Thứ trong tuần ----------
  'Chủ Nhật': 'Sunday',
  'Thứ Hai': 'Monday',
  'Thứ Ba': 'Tuesday',
  'Thứ Tư': 'Wednesday',
  'Thứ Năm': 'Thursday',
  'Thứ Sáu': 'Friday',
  'Thứ Bảy': 'Saturday',
  'CN': 'Sun',
  'Thứ 2': 'Mon',
  'Thứ 3': 'Tue',
  'Thứ 4': 'Wed',
  'Thứ 5': 'Thu',
  'Thứ 6': 'Fri',
  'Thứ 7': 'Sat',
  'Môn học': 'Subject',
  'CHỦ NHẬT': 'SUNDAY',
  'THỨ HAI': 'MONDAY',
  'THỨ BA': 'TUESDAY',
  'THỨ TƯ': 'WEDNESDAY',
  'THỨ NĂM': 'THURSDAY',
  'THỨ SÁU': 'FRIDAY',
  'THỨ BẢY': 'SATURDAY',
};

export default EN;
