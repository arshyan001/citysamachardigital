import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  CloudFog, 
  MapPin, 
  Search, 
  Navigation, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertCircle
} from 'lucide-react';

export default function WeatherWidget() {
  const { language, t } = useLanguage();
  
  // States
  const [city, setCity] = useState(() => localStorage.getItem('weather_city_name') || 'Sant Kabir Nagar');
  const [coords, setCoords] = useState(() => {
    const savedLat = localStorage.getItem('weather_lat');
    const savedLon = localStorage.getItem('weather_lon');
    return savedLat && savedLon 
      ? { lat: parseFloat(savedLat), lon: parseFloat(savedLon) }
      : { lat: 26.7845, lon: 83.0185 }; // Default Sant Kabir Nagar coords
  });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // WMO code helper
  const getWeatherDescription = (code, lang) => {
    const descriptions = {
      0: { en: 'Sunny / Clear Sky', hi: 'साफ़ धूप / साफ़ आसमान' },
      1: { en: 'Mainly Clear', hi: 'सामान्यतः साफ़' },
      2: { en: 'Partly Cloudy', hi: 'आंशिक रूप से बादल' },
      3: { en: 'Overcast', hi: 'सघन बादल छाए हैं' },
      45: { en: 'Foggy', hi: 'कोहरा' },
      48: { en: 'Depositing Rime Fog', hi: 'सघन कोहरा' },
      51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी' },
      53: { en: 'Moderate Drizzle', hi: 'बूंदाबांदी' },
      55: { en: 'Heavy Drizzle', hi: 'घनी बूंदाबांदी' },
      61: { en: 'Slight Rain', hi: 'हल्की बारिश' },
      63: { en: 'Moderate Rain', hi: 'मध्यम वर्षा' },
      65: { en: 'Heavy Rain', hi: 'भारी बारिश' },
      66: { en: 'Light Freezing Rain', hi: 'हल्की बर्फीली बारिश' },
      67: { en: 'Heavy Freezing Rain', hi: 'भारी बर्फीली बारिश' },
      71: { en: 'Slight Snow Fall', hi: 'हल्की बर्फबारी' },
      73: { en: 'Moderate Snow Fall', hi: 'मध्यम बर्फबारी' },
      75: { en: 'Heavy Snow Fall', hi: 'भारी बर्फबारी' },
      77: { en: 'Snow Grains', hi: 'ओले' },
      80: { en: 'Slight Rain Showers', hi: 'हल्की बौछारें' },
      81: { en: 'Moderate Rain Showers', hi: 'मध्यम बौछारें' },
      82: { en: 'Violent Rain Showers', hi: 'तेज बौछारें' },
      85: { en: 'Slight Snow Showers', hi: 'हल्की बर्फीली बौछारें' },
      86: { en: 'Heavy Snow Showers', hi: 'भारी बर्फीली बौछारें' },
      95: { en: 'Thunderstorm', hi: 'आंधी-तूफान' },
      96: { en: 'Thunderstorm with Hail', hi: 'ओलावृष्टि के साथ आंधी-तूफान' },
      99: { en: 'Severe Thunderstorm with Hail', hi: 'भारी ओलावृष्टि के साथ आंधी-तूफान' },
    };
    return descriptions[code]?.[lang] || (lang === 'en' ? 'Unsettled' : 'बदलते मौसम');
  };

  // Weather Icon helper
  const getWeatherIcon = (code, size = 28, color = '#fbbf24') => {
    if ([0].includes(code)) return <Sun size={size} style={{ color }} />;
    if ([1, 2].includes(code)) return <CloudSun size={size} style={{ color: '#9ca3af' }} />;
    if ([3].includes(code)) return <Cloud size={size} style={{ color: '#9ca3af' }} />;
    if ([45, 48].includes(code)) return <CloudFog size={size} style={{ color: '#9ca3af' }} />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} style={{ color: '#3b82f6' }} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake size={size} style={{ color: '#60a5fa' }} />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={size} style={{ color: '#a855f7' }} />;
    return <Cloud size={size} style={{ color: '#9ca3af' }} />;
  };

  // Dynamic news Weather Bulletin generator
  const generateWeatherNews = (cityName, current, daily, lang) => {
    const code = current.weather_code;
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const maxTemp = Math.round(daily.temperature_2m_max[0]);
    const minTemp = Math.round(daily.temperature_2m_min[0]);
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const rainSum = daily.precipitation_sum[0];

    const isHi = lang === 'hi';

    if (isHi) {
      let headline = `मौसम बुलेटिन: आज ${cityName} में `;
      let body = '';
      
      if ([0, 1].includes(code)) {
        headline += 'आसमान बिल्कुल साफ़ और मौसम गर्म रहने की संभावना है।';
        body = `आज का अधिकतम तापमान ${maxTemp}°C तक रहने की संभावना है, जबकि न्यूनतम तापमान ${minTemp}°C दर्ज किया जाएगा। वर्तमान में तापमान ${temp}°C है जो कि महसूस होने में ${feelsLike}°C जैसा लग रहा है। हवा ${windSpeed} किमी/घंटे की गति से चल रही है और आर्द्रता ${humidity}% है। तेज धूप होने के कारण दोपहर के समय पर्याप्त पानी पीकर ही घर से बाहर निकलें।`;
      } else if ([2, 3].includes(code)) {
        headline += 'आंशिक रूप से बादल छाए रहने और मौसम सुहावना रहने का अनुमान है।';
        body = `आज दिनभर बादलों की आवाजाही लगी रहेगी, जिससे धूप का असर कम होगा। अधिकतम तापमान ${maxTemp}°C और न्यूनतम तापमान ${minTemp}°C रहने की उम्मीद है। हवा की गति ${windSpeed} किमी/घंटा और आर्द्रता ${humidity}% होने से शाम को ठंडी हवाएं चल सकती हैं। भारी वर्षा का कोई पूर्वानुमान नहीं है।`;
      } else if ([45, 48].includes(code)) {
        headline += 'सुबह के समय कोहरे के कारण दृश्यता कम रहने की संभावना है।';
        body = `तापमान गिरने के साथ सुबह के वक्त दृश्यता कम रहेगी। अधिकतम तापमान ${maxTemp}°C और न्यूनतम तापमान ${minTemp}°C रहेगा। वाहन चालकों को धीमी गति से चलने और फॉग लाइट का उपयोग करने की सलाह दी जाती है।`;
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        headline += 'रिमझिम बारिश और ठंडी हवाओं का मौसम अलर्ट जारी।';
        body = `आज मौसम विभाग ने लगभग ${rainSum} मिमी वर्षा का अनुमान जताया है। वर्तमान में तापमान ${temp}°C बना हुआ है। हवा की गति ${windSpeed} किमी/घंटा तक पहुँच सकती है। बाहर निकलते समय छाता साथ रखें और जलभराव वाले क्षेत्रों से बचें।`;
      } else if ([95, 96, 99].includes(code)) {
        headline += 'भारी आंधी-तूफान और ओलावृष्टि की बड़ी चेतावनी।';
        body = `प्रशासन ने आज मौसम बिगड़ने की चेतावनी दी है। हवा की रफ्तार ${daily.wind_speed_10m_max[0]} किमी/घंटे से ऊपर जा सकती है। लोगों को पेड़ों, जर्जर भवनों और बिजली के खंभों से दूर रहने और सुरक्षित स्थानों पर शरण लेने की सलाह दी गई है।`;
      } else {
        headline += 'मौसम में उतार-चढ़ाव और बदलाव जारी रहने की उम्मीद है।';
        body = `आज तापमान ${minTemp}°C से ${maxTemp}°C के बीच बना रहेगा। हवा ${windSpeed} किमी/घंटे की रफ़्तार से चल रही है। मौसम विभाग स्थिति पर नज़र बनाए हुए है।`;
      }

      return { headline, body };
    } else {
      let headline = `Weather Bulletin: `;
      let body = '';

      if ([0, 1].includes(code)) {
        headline += `Clear skies and dry weather expected in ${cityName} today.`;
        body = `The maximum temperature is projected to reach ${maxTemp}°C, with a minimum of ${minTemp}°C. Currently, it is ${temp}°C (feels like ${feelsLike}°C). Winds are blowing at ${windSpeed} km/h with a relative humidity of ${humidity}%. Health officials advise drinking plenty of water during afternoon heat.`;
      } else if ([2, 3].includes(code)) {
        headline += `Partly cloudy skies to bring pleasant relief to ${cityName}.`;
        body = `Overcast conditions will keep temperatures mild today, ranging between ${minTemp}°C and ${maxTemp}°C. Humidity levels stand at ${humidity}%, ensuring a comfortable evening breeze. No heavy rainfall is expected.`;
      } else if ([45, 48].includes(code)) {
        headline += `Fog advisory active with reduced visibility in the area.`;
        body = `Drivers are urged to use caution due to early morning fog. Temperatures will range from ${minTemp}°C to ${maxTemp}°C. Conditions are expected to clear up by midday.`;
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        headline += `Rain alerts active for ${cityName} with light to moderate wet spells.`;
        body = `Showers are expected with a total daily precipitation forecast of ${rainSum}mm. Wind gusts can reach up to ${windSpeed} km/h. Don't forget to carry an umbrella and watch out for minor water logging on roads.`;
      } else if ([95, 96, 99].includes(code)) {
        headline += `Severe thunderstorm and wind warnings issued for ${cityName}.`;
        body = `Authorities urge residents to stay indoors as strong storms approach. Wind gusts may exceed ${daily.wind_speed_10m_max[0]} km/h, and hail is possible. Avoid taking shelter under high trees or power lines.`;
      } else {
        headline += `Mild shifts in local temperatures anticipated today.`;
        body = `Expect daily temperatures to hover between ${minTemp}°C and ${maxTemp}°C. Winds are stable at ${windSpeed} km/h with no active warning systems in place.`;
      }

      return { headline, body };
    }
  };

  // Reverse geocode lat/lon to city name using OSM Nominatim
  const fetchCityName = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
      if (res.ok) {
        const data = await res.json();
        const address = data.address;
        const resolvedName = address.city || address.town || address.village || address.suburb || address.county || 'Detected Area';
        setCity(resolvedName);
        localStorage.setItem('weather_city_name', resolvedName);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
  };

  // Fetch Weather Forecast
  const fetchWeather = async (latitude, longitude) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      } else {
        setErrorMsg(language === 'en' ? 'Weather data fetch failed' : 'मौसम का डेटा लाने में असमर्थ');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'en' ? 'Network error fetching weather' : 'नेटवर्क त्रुटि: मौसम डेटा नहीं मिला');
    } finally {
      setLoading(false);
    }
  };

  // Trigger weather fetch when coordinates change
  useEffect(() => {
    fetchWeather(coords.lat, coords.lon);
  }, [coords]);

  // Handle Geolocation request
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(language === 'en' ? 'Geolocation not supported by browser' : 'भौगोलिक स्थिति आपके ब्राउज़र द्वारा समर्थित नहीं है');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        localStorage.setItem('weather_lat', lat.toString());
        localStorage.setItem('weather_lon', lon.toString());
        await fetchCityName(lat, lon);
      },
      (error) => {
        console.warn(error);
        setErrorMsg(language === 'en' ? 'Permission denied or location lookup failed' : 'स्थान अनुमति अस्वीकार या स्थान खोजने में विफल');
      }
    );
  };

  // Handle City Search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`;
      const res = await fetch(geocodeUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const resolvedCity = result.name;
          const lat = result.latitude;
          const lon = result.longitude;
          
          setCity(resolvedCity);
          setCoords({ lat, lon });
          localStorage.setItem('weather_city_name', resolvedCity);
          localStorage.setItem('weather_lat', lat.toString());
          localStorage.setItem('weather_lon', lon.toString());
          setSearchCity('');
        } else {
          setErrorMsg(language === 'en' ? `City "${searchCity}" not found` : `शहर "${searchCity}" नहीं मिला`);
        }
      } else {
        setErrorMsg(language === 'en' ? 'City search failed' : 'शहर की खोज विफल रही');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'en' ? 'Network error searching city' : 'नेटवर्क त्रुटि: शहर नहीं खोजा जा सका');
    } finally {
      setLoading(false);
    }
  };

  // Generate 3 day forecast items helper
  const getForecastDays = () => {
    if (!weatherData || !weatherData.daily) return [];
    
    const days = [];
    const locale = language === 'en' ? 'en-US' : 'hi-IN';
    
    // We start from index 1 (tomorrow)
    for (let i = 1; i <= 3; i++) {
      const timeStr = weatherData.daily.time[i];
      const dateObj = new Date(timeStr);
      const dayName = dateObj.toLocaleDateString(locale, { weekday: 'short' });
      const dateString = dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      
      days.push({
        dayName,
        dateString,
        max: Math.round(weatherData.daily.temperature_2m_max[i]),
        min: Math.round(weatherData.daily.temperature_2m_min[i]),
        code: weatherData.daily.weather_code[i]
      });
    }
    return days;
  };

  const bulletin = weatherData && weatherData.current && weatherData.daily
    ? generateWeatherNews(city, weatherData.current, weatherData.daily, language)
    : null;

  return (
    <div className="widget-card" style={{ padding: '12px' }}>
      <div className="widget-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sun size={16} style={{ color: '#fbbf24' }} />
          {language === 'en' ? 'Weather - Forecast' : 'मौसम पूर्वानुमान'}
        </div>
        <button 
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showDetails 
            ? (language === 'en' ? 'Hide Details' : 'विवरण छिपाएं')
            : (language === 'en' ? 'Show Details' : 'विवरण देखें')
          }
        </button>
      </div>

      {/* Geolocation and Search Bar */}
      {showDetails && (
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <button 
            type="button" 
            onClick={handleGeolocation} 
            className="lang-toggle" 
            style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', flexShrink: 0, borderRadius: '6px' }}
            title={language === 'en' ? 'Use my current location' : 'मेरा स्थान खोजें'}
          >
            <Navigation size={13} style={{ transform: 'rotate(45deg)' }} />
          </button>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search city...' : 'शहर खोजें...'}
              className="form-control"
              style={{ height: '30px', fontSize: '12px', paddingLeft: '26px', background: 'rgba(11, 15, 25, 0.4)', paddingRight: '6px' }}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Search size={11} style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--color-text-secondary)' }} />
          </div>
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 10px', height: '30px', fontSize: '11px', borderRadius: '6px' }}>
            {language === 'en' ? 'Go' : 'खोजें'}
          </button>
        </form>
      )}

      {showDetails && errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '4px', marginBottom: '10px' }}>
          <AlertCircle size={12} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && !weatherData ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          {language === 'en' ? 'Loading weather...' : 'मौसम लोड हो रहा है...'}
        </div>
      ) : weatherData ? (
        <>
          {/* Main Weather Information Display */}
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: showDetails ? '12px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <MapPin size={12} style={{ color: 'var(--color-primary)' }} />
                  {city}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginRight: '4px', animation: 'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                  {language === 'en' ? 'Live' : 'लाइव'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getWeatherIcon(weatherData.current.weather_code, 28)}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {Math.round(weatherData.current.temperature_2m)}°C
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                  {getWeatherDescription(weatherData.current.weather_code, language)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Thermometer size={12} style={{ color: '#fbbf24' }} />
                <span>{language === 'en' ? 'Feels:' : 'महसूस:'} {Math.round(weatherData.current.apparent_temperature)}°C</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={12} style={{ color: '#3b82f6' }} />
                <span>{language === 'en' ? 'Humidity:' : 'आर्द्रता:'} {weatherData.current.relative_humidity_2m}%</span>
              </div>
            </div>
          </div>

          {/* Dynamic Weather News Bulletin */}
          {showDetails && bulletin && (
            <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(139, 0, 0, 0.05) 100%)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '4px' }}>
                <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: 'red', animation: 'pulse 1.2s infinite' }}></span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  {language === 'en' ? 'Weather Bulletin' : 'दैनिक मौसम समाचार'}
                </span>
              </div>
              <h5 style={{ fontSize: '11.5px', color: '#fff', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.3' }}>
                {bulletin.headline}
              </h5>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4', margin: 0 }}>
                {bulletin.body}
              </p>
            </div>
          )}

          {/* 3-Day Forecast Grid */}
          {showDetails && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <h5 style={{ fontSize: '11px', color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
                {language === 'en' ? '3-Day Forecast' : '3 दिवसीय पूर्वानुमान'}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {getForecastDays().map((day, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: 'rgba(255,255,255,0.01)', 
                      padding: '6px 8px', 
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ width: '70px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{day.dayName}</div>
                      <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>{day.dateString}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={getWeatherDescription(day.code, language)}>
                      {getWeatherIcon(day.code, 14)}
                      <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', width: '55px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getWeatherDescription(day.code, language)}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', textAlign: 'right' }}>
                      <span>{day.max}°</span>
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '10px', marginLeft: '4px' }}>{day.min}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
