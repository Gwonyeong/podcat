"use client";

export default function LandingFooterSection() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "기능", href: "#" },
      { name: "가격", href: "#" },
      { name: "API", href: "#" },
      { name: "문서", href: "#" },
    ],
    company: [
      { name: "회사 소개", href: "#" },
      { name: "블로그", href: "#" },
      { name: "채용", href: "#" },
      { name: "연락처", href: "#" },
    ],
    support: [
      { name: "도움말", href: "#" },
      { name: "커뮤니티", href: "#" },
      { name: "상태", href: "#" },
      { name: "보안", href: "#" },
    ],
    legal: [
      { name: "개인정보처리방침", href: "#" },
      { name: "이용약관", href: "#" },
      { name: "쿠키 정책", href: "#" },
      { name: "라이선스", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "#", icon: "🐦" },
    { name: "Facebook", href: "#", icon: "📘" },
    { name: "Instagram", href: "#", icon: "📷" },
    { name: "LinkedIn", href: "#", icon: "💼" },
    { name: "YouTube", href: "#", icon: "📺" },
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm0 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 mb-12">
          {/* Podcat 브랜드 */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img
                src="/logo.png"
                alt="Podcat Logo"
                className="w-12 h-12 mr-3 filter brightness-0 invert"
              />
              <span className="text-2xl font-bold">Podcat</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI가 큐레이션하는 개인 맞춤형 오디오 뉴스레터. 바쁜 일상에서도
              놓치지 않는 핵심 정보를 15분 안에.
            </p>

            {/* 소셜 링크 */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 제품 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">제품</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">회사</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">지원</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">법적 고지</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-8 mb-8"></div>

        {/* 하단 푸터 */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="text-gray-400 text-sm mb-4 sm:mb-0">
            © {currentYear} Podcat. 모든 권리 보유.
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-4 sm:space-x-6 text-sm text-gray-400">
            <span>Made with ❤️ in Korea</span>
            <span className="hidden sm:inline">•</span>
            <span>Version 2.0</span>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center px-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              매일 아침, AI가 큐레이션한 오디오 뉴스레터로 하루를 더 스마트하게 시작하세요.
              지속적인 발전을 통해 더 나은 서비스를 제공합니다.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="text-blue-400">🎧</span>
              <span className="text-purple-400">📰</span>
              <span className="text-green-400">🤖</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
