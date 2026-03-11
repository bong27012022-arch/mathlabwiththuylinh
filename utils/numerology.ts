
import { NumerologyProfile } from "../types";

// Helper: Remove Vietnamese accents
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

// Helper: Calculate sum of digits recursively until single digit (or 11, 22, 33)
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  
  let sum = 0;
  const digits = num.toString().split('');
  digits.forEach(d => sum += parseInt(d));
  
  return reduceNumber(sum);
};

// Calculate Life Path Number (Số Đường Đời) from DOB
export const calculateLifePath = (dob: string): number => {
  if (!dob) return 0;
  const digits = dob.replace(/\D/g, '');
  if (digits.length < 6) return 0; 
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i]);
  }
  return reduceNumber(sum);
};

// Knowledge Base based on PDF Content
const NUMEROLOGY_DATA: Record<number, Omit<NumerologyProfile, 'lifePathNumber'>> = {
  1: {
    title: "SỐ 1: NGƯỜI TIÊN PHONG",
    overview: "Độc lập, mạnh mẽ, có ý chí sắt đá. Bạn sinh ra để dẫn đầu, không thích đi theo lối mòn và luôn muốn khẳng định bản thân.",
    learningStyle: "Tự học, tự nghiên cứu, học qua dự án cá nhân. Thích được giao 'nhiệm vụ' hơn là 'bài tập'.",
    competencies: "Cao khi được làm việc độc lập và theo đuổi mục tiêu riêng. Dễ mất tập trung khi bị ép làm điều không thích.",
    motivation: "Mong muốn được công nhận, chiến thắng, trở thành người giỏi nhất (Nhà Vô Địch, Người Dẫn Đầu).",
    mathApproach: "Logic, thẳng thắn, tìm cách giải quyết nhanh và hiệu quả nhất. Thích các bài toán có một đáp án duy nhất và rõ ràng.",
    strengths: "Tư duy độc lập, không thích đi theo lối mòn. Quyết tâm cao, một khi đặt mục tiêu sẽ theo đuổi đến cùng. Can đảm, không ngại rủi ro.",
    challenges: "Cái tôi cao, đôi khi trở nên độc đoán. Thiếu kiên nhẫn, khó lắng nghe ý kiến người khác. Có xu hướng tự cô lập khi gặp khó khăn.",
    learningMethods: "Đặt mục tiêu rõ ràng, thách thức bản thân. Tự tạo các 'nhiệm vụ' cụ thể. Học qua nghiên cứu case study.",
    environment: "Không gian riêng, yên tĩnh. Không bị gò bó, áp đặt. Có quyền tự do lựa chọn cách học.",
    conclusion: "Bạn là một nhà lãnh đạo bẩm sinh. Hãy tận dụng sự độc lập để chinh phục các bài toán khó, nhưng đừng quên lắng nghe sự hướng dẫn khi cần thiết."
  },
  2: {
    title: "SỐ 2: NGƯỜI HÒA GIẢI",
    overview: "Nhạy cảm, tinh tế, yêu hòa bình. Bạn là người kết nối tuyệt vời, luôn lắng nghe và thấu hiểu người khác.",
    learningStyle: "Học nhóm, học có bạn đồng hành (đôi bạn cùng tiến). Thích môi trường hài hòa, không áp lực cạnh tranh.",
    competencies: "Cao trong môi trường yên tĩnh, ổn định. Dễ bị phân tâm bởi cảm xúc và các mối quan hệ xung quanh.",
    motivation: "Mong muốn được giúp đỡ người khác, kết nối, và nhận được sự yêu thương, công nhận từ thầy cô, bạn bè.",
    mathApproach: "Tuân tự, cẩn thận, tỉ mỉ. Thích những bài toán có hướng dẫn rõ ràng từng bước. Cần sự đảm bảo và khích lệ.",
    strengths: "Khả năng lắng nghe và thấu cảm tuyệt vời. Giỏi làm việc nhóm, kết nối mọi người. Trực giác tốt, nhạy bén với cảm xúc.",
    challenges: "Quá nhạy cảm, dễ bị tổn thương bởi lời nói. Thiếu quyết đoán, hay do dự. Sợ đối đầu, không dám nói lên ý kiến khác.",
    learningMethods: "Học cùng bạn, giải thích lại cho bạn để hiểu sâu hơn. Tạo nhóm học tập ổn định, thân thiện. Sử dụng phương pháp học từng bước.",
    environment: "Hài hòa, không căng thẳng. Có sự hỗ trợ từ bạn bè, thầy cô. Không khí hợp tác thay vì cạnh tranh gay gắt.",
    conclusion: "Sức mạnh của bạn nằm ở sự kiên nhẫn và kết nối. Hãy tìm một người bạn đồng hành để việc học toán trở nên thú vị và bớt áp lực hơn."
  },
  3: {
    title: "SỐ 3: NGƯỜI TRUYỀN CẢM HỨNG",
    overview: "Sáng tạo, lạc quan, hoạt ngôn. Bạn mang lại niềm vui và năng lượng tích cực cho mọi người xung quanh.",
    learningStyle: "Học qua hình ảnh, âm nhạc, câu chuyện, trò chơi (Gamification). Thích môi trường vui vẻ, năng động.",
    competencies: "Thấp, đặc biệt với những chủ đề không hứng thú. Cần sự mới mẻ liên tục để duy trì sự tập trung.",
    motivation: "Niềm vui, sự hứng thú, được thể hiện bản thân. Được người khác tán thưởng sự sáng tạo.",
    mathApproach: "Sáng tạo, tìm những lối đi bất ngờ. Không thích đi theo khuôn mẫu. Thường 'nhảy bước' trong suy nghĩ.",
    strengths: "Óc sáng tạo và trí tưởng tượng bay bổng. Nhanh trí, linh hoạt trong tư duy. Có khả năng nghệ thuật và ngôn ngữ tốt.",
    challenges: "Dễ mất tập trung, cả thèm chóng chán. Thiếu kỷ luật, hay trì hoãn công việc. Nói nhiều hơn làm, đôi khi hời hợt.",
    learningMethods: "Biến học tập thành trò chơi, thử thách vui. Sử dụng nhiều phương tiện đa dạng (video, hình ảnh). Học qua kể chuyện.",
    environment: "Vui vẻ, năng động, đầy màu sắc. Có nhiều hoạt động tương tác. Không gò bó, khuyến khích sáng tạo.",
    conclusion: "Bạn sở hữu trí tuệ linh hoạt tuyệt vời. Hãy biến các con số khô khan thành những câu chuyện hoặc trò chơi thú vị để phát huy tối đa khả năng."
  },
  4: {
    title: "SỐ 4: NGƯỜI XÂY DỰNG",
    overview: "Thực tế, kỷ luật, tỉ mỉ. Bạn là người đáng tin cậy, thích sự rõ ràng và trật tự trong mọi việc.",
    learningStyle: "Học có cấu trúc rõ ràng, theo quy trình, từng bước một. Thích lịch trình ổn định, lặp lại đều đặn.",
    competencies: "Cao, đặc biệt với những công việc chi tiết. Có thể tập trung lâu nếu biết rõ mục tiêu. Không bị phân tâm dễ dàng.",
    motivation: "Muốn xây dựng nền móng vững chắc, thấy kết quả cụ thể từng bước. Thích sự ổn định và có thể dự đoán được.",
    mathApproach: "Tuân tự, có hệ thống, từng bước một. Không bỏ qua bất kỳ bước nào. Kiểm tra lại nhiều lần để đảm bảo chính xác.",
    strengths: "Làm việc chăm chỉ, kiên định. Tổ chức tốt, có kế hoạch rõ ràng. Đáng tin cậy, hoàn thành đúng hạn.",
    challenges: "Cứng nhắc, khó thay đổi khi đã quen. Quá lo lắng về chi tiết, thiếu cái nhìn tổng thể. Thiếu linh hoạt, khó chấp nhận cái mới.",
    learningMethods: "Lập kế hoạch học tập chi tiết, cụ thể. Chia nhỏ mục tiêu thành các bước nhỏ. Tạo thói quen học tập đều đặn.",
    environment: "Có cấu trúc rõ ràng, ổn định. Quy tắc nhất quán, không thay đổi đột ngột. Không gian gọn gàng, ngăn nắp.",
    conclusion: "Sự kiên trì là vũ khí mạnh nhất của bạn. Hãy giữ vững kỷ luật, nhưng đôi khi hãy cho phép bản thân linh hoạt hơn để tìm ra những giải pháp mới."
  },
  5: {
    title: "SỐ 5: NGƯỜI TỰ DO",
    overview: "Yêu tự do, thích khám phá, đa tài. Bạn ghét sự gò bó và luôn tìm kiếm những trải nghiệm mới lạ, thú vị.",
    learningStyle: "Học qua trải nghiệm, thám hiểm, khám phá. Cần sự đa dạng, thay đổi liên tục. Thích học nhiều môn cùng lúc.",
    competencies: "Rất thấp với những chủ đề nhàm chán. Cần sự mới mẻ liên tục để duy trì hứng thú. Dễ bị bồn chồn.",
    motivation: "Khám phá cái mới, trải nghiệm đa dạng, được tự do chọn lựa. Thích sự phiêu lưu và bất ngờ.",
    mathApproach: "Thử nhiều cách, nhảy qua nhảy lại. Không theo trình tự cố định. Thích giải quyết nhanh để chuyển sang vấn đề khác.",
    strengths: "Thích nghi nhanh với môi trường mới. Linh hoạt, đa tài. Tò mò, ham học hỏi. Dũng cảm thử nghiệm.",
    challenges: "Thiếu kiên nhẫn, không kiên định. Dễ bồn chồn, không chịu ràng buộc. Thiếu trách nhiệm, bỏ dở giữa chừng.",
    learningMethods: "Thay đổi phương pháp học thường xuyên. Học qua du lịch, trải nghiệm thực tế. Kết hợp nhiều môn học.",
    environment: "Tự do, không gò bó. Nhiều sự lựa chọn, tính bất ngờ cao. Có cơ hội di chuyển, khám phá.",
    conclusion: "Năng lượng của bạn là vô tận. Hãy hướng sự tò mò vào việc khám phá các khía cạnh đa dạng của toán học, bạn sẽ thấy nó không hề nhàm chán."
  },
  6: {
    title: "SỐ 6: NGƯỜI CHĂM SÓC",
    overview: "Trách nhiệm, yêu thương, hướng về gia đình. Bạn luôn quan tâm đến người khác và mong muốn mọi thứ hoàn hảo.",
    learningStyle: "Học qua việc chăm sóc, giúp đỡ người khác. Thích các bài học có ý nghĩa nhân văn. Học tốt khi thấy kiến thức có ích cho cộng đồng.",
    competencies: "Cao khi học những gì có ý nghĩa với gia đình/cộng đồng. Dễ bị phân tâm bởi nhu cầu chăm sóc người khác.",
    motivation: "Giúp đỡ người khác, làm điều có ý nghĩa, được yêu thương. Muốn trở thành người có ích.",
    mathApproach: "Liên hệ với cuộc sống thực tế. Ứng dụng vào việc giúp đỡ người khác. Giải quyết vấn đề có tính nhân văn.",
    strengths: "Giàu lòng trắc ẩn, quan tâm người khác. Trách nhiệm cao, chu đáo. Khả năng chăm sóc, hỗ trợ tốt.",
    challenges: "Lo lắng quá mức, đặc biệt cho người khác. Can thiệp thái quá, muốn giúp mọi người. Hy sinh bản thân, quên nhu cầu riêng.",
    learningMethods: "Học qua việc dạy lại cho người khác. Tham gia các dự án cộng đồng. Kết nối kiến thức với ứng dụng thực tế.",
    environment: "Ấm áp, hỗ trợ lẫn nhau. Có ý nghĩa nhân văn, giúp đỡ cộng đồng. Không khí hòa đồng, thân thiện.",
    conclusion: "Trái tim nhân hậu là điểm tựa của bạn. Hãy học tập với tâm thế dùng tri thức để giúp đỡ mọi người, bạn sẽ tìm thấy động lực to lớn."
  },
  7: {
    title: "SỐ 7: NGƯỜI TRÍ TUỆ",
    overview: "Sâu sắc, thích phân tích, tìm tòi chân lý. Bạn luôn đặt câu hỏi 'Tại sao' và muốn hiểu bản chất gốc rễ của vấn đề.",
    learningStyle: "Học qua nghiên cứu sâu, phân tích, tìm hiểu bản chất. Cần không gian yên tĩnh để suy ngẫm.",
    competencies: "Rất cao khi học một mình, không bị làm phiền. Có thể tập trung sâu trong thời gian dài.",
    motivation: "Hiểu 'tại sao', khám phá bí ẩn, đạt đến sự thật. Thích tìm hiểu bản chất, nguồn gốc vấn đề.",
    mathApproach: "Phân tích từng chi tiết, tìm hiểu bản chất. Cần biết 'tại sao' trước khi làm. Suy ngẫm kỹ trước khi đưa ra kết luận.",
    strengths: "Phân tích sâu sắc, logic. Trực giác mạnh mẽ. Tư duy phản biện tốt. Độc lập tinh thần, tự học tốt.",
    challenges: "Xu hướng cô độc, xa cách. Hoài nghi quá mức, khó tin người. Khó chia sẻ cảm xúc, suy nghĩ.",
    learningMethods: "Nghiên cứu chuyên sâu, đọc nhiều sách. Suy ngẫm, chiêm nghiệm một mình. Tìm hiểu nguồn gốc, bản chất vấn đề.",
    environment: "Yên tĩnh, sâu lắng. Không bị làm phiền, có không gian riêng. Được tự do suy ngẫm, nghiên cứu.",
    conclusion: "Bạn là một nhà tư tưởng bẩm sinh. Hãy dành thời gian yên tĩnh để đào sâu kiến thức, đó là cách bạn tỏa sáng rực rỡ nhất."
  },
  8: {
    title: "SỐ 8: NGƯỜI LÃNH ĐẠO",
    overview: "Mạnh mẽ, thực tế, tham vọng. Bạn nhạy bén với các con số, tài chính và luôn hướng tới thành công, địa vị.",
    learningStyle: "Học có mục tiêu rõ ràng, đo lường được thành công. Thích học những gì mang lại lợi ích cụ thể.",
    competencies: "Cao khi thấy mục tiêu rõ ràng và có ý nghĩa. Kiên trì với những gì mang lại thành công.",
    motivation: "Thành công, giàu có, quyền lực, danh vọng. Muốn đạt được vị thế cao và được tôn trọng.",
    mathApproach: "Hiệu quả, nhanh chóng, tập trung kết quả. Áp dụng chiến lược, tính toán lợi ích.",
    strengths: "Lãnh đạo mạnh mẽ, quyết đoán. Tham vọng lớn, không ngừng nỗ lực. Tổ chức tốt, quản lý thời gian hiệu quả.",
    challenges: "Háo danh, thích quyền lực quá mức. Vật chất hóa giá trị học tập. Bỏ bê cảm xúc, mối quan hệ. Đôi khi quá thực dụng.",
    learningMethods: "Đặt mục tiêu cụ thể, đo lường được. Học những gì có giá trị thực tế. Tham gia các dự án có tính cạnh tranh.",
    environment: "Có mục tiêu rõ ràng, đo lường thành công. Môi trường chuyên nghiệp, nghiêm túc. Có cơ hội thể hiện năng lực lãnh đạo.",
    conclusion: "Bạn có tố chất của người đứng đầu. Hãy đặt ra những mục tiêu lớn cho việc học và chinh phục chúng như một nhà chinh phạt thực thụ."
  },
  9: {
    title: "SỐ 9: NGƯỜI NHÂN ÁI",
    overview: "Bao dung, nhân hậu, có tầm nhìn lớn. Bạn là người lý tưởng hóa, luôn muốn cống hiến để thế giới tốt đẹp hơn.",
    learningStyle: "Học có ý nghĩa nhân văn sâu sắc, liên quan đến việc giúp đỡ thế giới. Thích học những gì có giá trị cho cộng đồng.",
    competencies: "Cao khi học những gì có ý nghĩa lớn lao. Khó tập trung với những điều nhỏ nhặt, chi tiết.",
    motivation: "Cống hiến cho cộng đồng, thay đổi thế giới, giúp đỡ người khác. Lý tưởng cao đẹp, tính nhân văn.",
    mathApproach: "Nhìn tổng thể, kết nối với bức tranh lớn. Tìm ý nghĩa sâu xa của vấn đề. Giải quyết với tư duy vị nhân sinh.",
    strengths: "Lòng trắc ẩn sâu sắc, vị tha. Nhìn xa, có tầm nhìn rộng. Sáng tạo, trí tuệ cảm xúc cao.",
    challenges: "Lý tưởng hóa, khó thực tế. Dễ thất vọng khi không đạt được lý tưởng. Hy sinh thái quá, quên bản thân. Cảm xúc thất thường.",
    learningMethods: "Kết nối kiến thức với vấn đề xã hội. Học qua dự án cộng đồng. Tìm hiểu các vấn đề toàn cầu.",
    environment: "Có ý nghĩa nhân văn sâu sắc. Liên quan đến cộng đồng, xã hội. Không khí hợp tác, chia sẻ.",
    conclusion: "Bạn mang trong mình những hoài bão lớn lao. Hãy nhìn thấy bức tranh toàn cảnh trong mỗi bài toán, bạn sẽ tìm thấy lời giải cho cả thế giới."
  },
  11: {
    title: "SỐ 11: BẬC THẦY TRỰC GIÁC",
    overview: "Trực giác cực mạnh, nhạy cảm, tinh tế. Bạn sở hữu tiềm năng tâm linh và khả năng truyền cảm hứng lớn lao.",
    learningStyle: "Học qua trực giác, cảm nhận, kết nối tâm linh. Nhận biết patterns (mẫu hình) một cách trực quan.",
    competencies: "Cao khi môi trường yên bình, tâm linh. Dễ bị áp lực cao làm mất tập trung. Cần cân bằng cảm xúc.",
    motivation: "Giác ngộ, kết nối vũ trụ qua con số, truyền cảm hứng. Tìm kiếm sự thật sâu xa, ý nghĩa siêu hình.",
    mathApproach: "Trực giác trước, logic sau. Thấy mẫu hình, quy luật một cách trực quan. Không cần giải thích tại sao biết, chỉ 'cảm nhận'.",
    strengths: "Trực giác siêu phàm, nhạy bén cực độ. Khả năng nhận dạng patterns xuất sắc. Sáng tạo phi thường.",
    challenges: "Căng thẳng thần kinh, áp lực kỳ vọng cao. Quá nhạy cảm với môi trường xung quanh. Mộng mơ, thiếu thực tế.",
    learningMethods: "Tin vào trực giác, cảm nhận của mình. Học qua thiền định, mindfulness. Tìm hiểu về tâm linh, siêu hình học.",
    environment: "Yên bình, tâm linh. Khuyến khích trực giác, cảm nhận. Không áp lực, căng thẳng.",
    conclusion: "Trực giác là món quà quý giá nhất của bạn. Hãy tin vào những 'cảm giác' ban đầu khi giải toán, chúng thường dẫn bạn đến đáp án đúng."
  },
  22: {
    title: "SỐ 22: KIẾN TRÚC SƯ ĐẠI TÀI",
    overview: "Tầm nhìn vĩ mô kết hợp hành động thực tế. Bạn có khả năng biến những giấc mơ lớn thành hiện thực.",
    learningStyle: "Học qua dự án lớn, kế hoạch dài hạn, xây dựng hệ thống. Thích các mục tiêu vĩ đại có tính thực tiễn cao.",
    competencies: "Rất cao với các dự án lớn, có ý nghĩa. Kiên trì dài hạn với mục tiêu vĩ đại. Không bị phân tâm bởi chi tiết nhỏ.",
    motivation: "Xây dựng nền móng cho tương lai, tạo ra điều vĩ đại. Tác động lớn, thay đổi hệ thống. Để lại di sản.",
    mathApproach: "Hệ thống + tầm nhìn. Từng bước nhưng hướng đến mục tiêu lớn. Kết hợp trực giác và logic.",
    strengths: "Tham vọng lớn có tính thực tế. Tổ chức xuất sắc, quản lý dự án tốt. Kiên định phi thường với mục tiêu lớn.",
    challenges: "Áp lực cao từ bản thân và người khác. Căng thẳng vì mục tiêu quá lớn. Có thể trở nên cứng nhắc.",
    learningMethods: "Lập kế hoạch dài hạn, từng giai đoạn. Học qua các dự án lớn, có tác động rộng. Kết hợp lý thuyết và thực hành.",
    environment: "Có mục tiêu lớn, tầm ảnh hưởng rộng. Môi trường nghiêm túc, chuyên nghiệp. Có nguồn lực để thực hiện dự án lớn.",
    conclusion: "Bạn sinh ra để làm những việc lớn. Hãy chia nhỏ những mục tiêu vĩ đại thành các bước đi vững chắc, thành công sẽ nằm trong tầm tay."
  }
};

export const analyzeProfile = (name: string, dob: string): NumerologyProfile => {
  const lifePath = calculateLifePath(dob);
  
  // Default to Number 1 data if something goes wrong, but calculations should be robust
  const baseProfile = NUMEROLOGY_DATA[lifePath] || NUMEROLOGY_DATA[1];

  return {
    lifePathNumber: lifePath,
    ...baseProfile
  };
};
