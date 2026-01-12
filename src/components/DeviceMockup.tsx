interface DeviceMockupProps {
  type: 'iphone' | 'macbook';
  image?: string;
  placeholderText?: string;
}

export function DeviceMockup({ type, image, placeholderText = 'Görsel yükleyin' }: DeviceMockupProps) {
  if (type === 'macbook') {
    return (
      <div className="inline-block scale-100 origin-top">
        {/* MacBook Air Mockup */}
        <div className="relative">
          {/* Screen */}
          <div className="bg-gray-900 rounded-t-2xl p-3 shadow-2xl">
            <div className="bg-black rounded-lg overflow-hidden relative" style={{ width: '600px', height: '375px' }}>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

              {/* Screen Content */}
              <div className="w-full h-full bg-gray-100">
                {image ? (
                  <img
                    src={image}
                    alt="Screen content"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-400">{placeholderText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Base */}
          <div className="relative">
            {/* Hinge */}
            <div className="h-1 bg-gradient-to-b from-gray-800 to-gray-700"></div>
            {/* Keyboard base */}
            <div
              className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-2xl shadow-xl"
              style={{
                width: '640px',
                height: '20px',
                marginLeft: '-20px'
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-gray-200/50 to-transparent rounded-b-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iPhone 17 Pro Mockup
  return (
    <div className="inline-block">
      <div className="relative bg-gray-900 rounded-[3.5rem] shadow-2xl p-3" style={{ width: '340px', height: '690px' }}>
        {/* Dynamic Island */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-20"></div>

        {/* Screen */}
        <div className="relative w-full h-full bg-black rounded-[2.8rem] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt="Screen content"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400 text-sm px-6 text-center">{placeholderText}</p>
            </div>
          )}
        </div>

        {/* Side buttons */}
        <div className="absolute -left-1 top-32 w-1 h-12 bg-gray-800 rounded-l"></div>
        <div className="absolute -left-1 top-48 w-1 h-16 bg-gray-800 rounded-l"></div>
        <div className="absolute -left-1 top-68 w-1 h-16 bg-gray-800 rounded-l"></div>
        <div className="absolute -right-1 top-48 w-1 h-24 bg-gray-800 rounded-r"></div>
      </div>
    </div>
  );
}
