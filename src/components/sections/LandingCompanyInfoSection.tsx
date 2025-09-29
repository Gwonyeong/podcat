"use client";

export default function LandingCompanyInfoSection() {
  const companyStats = [
    { number: "10K+", label: "활성 사용자", icon: "👥" },
    { number: "50K+", label: "생성된 뉴스레터", icon: "📰" },
    { number: "99.9%", label: "서비스 가동률", icon: "⚡" },
    { number: "24/7", label: "AI 큐레이션", icon: "🤖" },
  ];

  const teamMembers = [
    {
      name: "김개발",
      role: "Lead Developer",
      image: "/images/it-baehyun.jpg",
      description: "10년 경력의 풀스택 개발자",
      skills: ["React", "Node.js", "AI/ML"],
    },
    {
      name: "박디자인",
      role: "UX Designer",
      image: "/images/coffeeInCafeWithYoungGirl.png",
      description: "사용자 중심의 디자인 전문가",
      skills: ["Figma", "UI/UX", "Prototyping"],
    },
    {
      name: "이기획",
      role: "Product Manager",
      image: "/images/global-namsu.jpg",
      description: "제품 전략 및 기획 전문가",
      skills: ["Product Strategy", "Data Analysis", "User Research"],
    },
  ];

  const technologies = [
    { name: "Next.js 14", icon: "⚛️", description: "최신 React 프레임워크" },
    { name: "TypeScript", icon: "🔷", description: "타입 안전성 보장" },
    { name: "Tailwind CSS", icon: "🎨", description: "유틸리티 우선 CSS" },
    { name: "Prisma", icon: "🗄️", description: "현대적인 ORM" },
    { name: "Zustand", icon: "📦", description: "경량 상태 관리" },
    { name: "AI/ML", icon: "🧠", description: "인공지능 기술" },
  ];

  return (
    <section className="landing-section py-20 px-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* 회사 통계 */}
        <div className="text-center mb-20 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Podcat의 성과
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-16">
            오디오 뉴스레터 서비스로 달성한 놀라운 성과들을 확인해보세요.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {companyStats.map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer transform transition-all duration-500 hover:scale-110"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 팀 소개 */}
        <div className="mb-20 px-4">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              우리 팀을 소개합니다
            </h3>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              오디오 뉴스레터 서비스를 만들어가는 열정적인 팀원들을 만나보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  {member.name}
                </h4>
                <p className="text-slate-700 font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {member.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="mb-20 px-4">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              최신 기술로 구축
            </h3>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              안정적이고 확장 가능한 오디오 뉴스레터 플랫폼을 위한 최신 기술
              스택.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group cursor-pointer"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  {tech.name}
                </h4>
                <p className="text-sm text-slate-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 회사 가치 */}
        <div className="text-center px-4">
          <div className="bg-gradient-to-r from-slate-900 to-black rounded-3xl p-8 sm:p-12 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              Podcat의 핵심 가치
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8">
              <div>
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-semibold mb-2">사용자 중심</h4>
                <p className="text-gray-300">
                  사용자 경험을 최우선으로 생각합니다
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🚀</div>
                <h4 className="text-xl font-semibold mb-2">혁신</h4>
                <p className="text-gray-300">최신 기술로 끊임없이 발전합니다</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-xl font-semibold mb-2">협력</h4>
                <p className="text-gray-300">
                  팀워크를 통해 큰 성과를 만듭니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
