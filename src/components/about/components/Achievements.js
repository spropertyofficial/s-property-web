export default function Achievements() {
    const achievements = [
      { number: "300+", text: "Property Terjual" },
      { number: "50+", text: "Agent Partner" },
      { number: "20+", text: "Developer Partner" },
      { number: "500+", text: "Klien Puas" }
    ];
  
    return (
      <section className="py-16 bg-tosca-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Pencapaian Kami</h2>
            <div className="w-16 h-1 bg-tosca-500 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Perkembangan yang telah kami capai sejak didirikan hingga saat ini.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {achievements.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center shadow-sm">
                <div className="text-4xl font-bold text-tosca-500 mb-2">{item.number}</div>
                <p className="text-gray-600 text-sm md:text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }