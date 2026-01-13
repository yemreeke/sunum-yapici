"use client";

import { useState, useEffect } from 'react';
import { Download, Edit, Eye, ChevronLeft, ChevronRight, Layout, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceMockup } from '@/components/DeviceMockup';



const GRADIENTS = [
  { id: 'none', name: 'Yok', value: '' },
  { id: 'sunset', name: 'Gün Batımı', value: 'bg-gradient-to-r from-orange-400 to-pink-500' },
  { id: 'ocean', name: 'Okyanus', value: 'bg-gradient-to-r from-blue-400 to-cyan-500' },
  { id: 'forest', name: 'Orman', value: 'bg-gradient-to-r from-emerald-400 to-green-500' },
  { id: 'purple', name: 'Mor Sis', value: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
  { id: 'fire', name: 'Ateş', value: 'bg-gradient-to-br from-red-500 to-orange-600' },
  { id: 'sky', name: 'Gökyüzü', value: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
];

const INITIAL_COVER = {
  title: 'Başlık',
  subtitle: 'Alt Başlık',
  organization: 'Kurum/Firma',
  customBackgroundColor: '',
  gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
};

const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
  theme: 'cyan',
  showSlideCount: true,
  showTOC: true
};

const INITIAL_SLIDES: SlideData[] = [
  {
    id: 1,
    tag: 'Mobil Görünüm',
    title: 'Mobil Deneyim',
    description: 'Uygulamanın mobil arayüzü ve özellikleri',
    features: ['Hızlı Erişilebilirlik', 'Kullanıcı Dostu Tasarım', 'Modern Deneyim'],
    deviceType: 'iphone',
    theme: 'cyan',
    layout: 'left'
  },
  {
    id: 2,
    tag: 'Web Görünüm',
    title: 'Web Platformu',
    description: 'Geniş ekran deneyimi ve yönetim paneli',
    features: ['Gelişmiş Filtreleme', 'Detaylı İstatistikler', 'Çoklu Yönetim'],
    deviceType: 'macbook',
    theme: 'cyan',
    layout: 'right'
  }
];

const INITIAL_END = {
  title: 'Teşekkürler',
  subtitle: 'İletişim için:',
  contact1: 'İletişim Bilgisi 1',
  contact2: 'İletişim Bilgisi 2',
  customBackgroundColor: '',
  gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
};

interface SlideData {
  id: number;
  tag: string;
  title: string;
  description: string;
  features: string[];
  image?: string;
  backgroundColor?: string; // Tailwind class
  customBackgroundColor?: string; // Hex code
  gradient?: string; // Tailwind gradient class
  deviceType?: 'iphone' | 'macbook';
  theme?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink';
  layout?: 'left' | 'right'; // Image position
}

interface GlobalSettings {
  theme: 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'gray' | 'dark';
  customBackgroundColor?: string;
  gradient?: string;
  showSlideCount: boolean;
  showTOC: boolean;
}

const getThemeColors = (theme: string = 'cyan') => {
  const themes = {
    cyan: {
      tagBg: 'bg-cyan-100',
      tagText: 'text-cyan-700',
      bulletColor: 'text-cyan-600',
    },
    purple: {
      tagBg: 'bg-purple-100',
      tagText: 'text-purple-700',
      bulletColor: 'text-purple-600',
    },
    green: {
      tagBg: 'bg-green-100',
      tagText: 'text-green-700',
      bulletColor: 'text-green-600',
    },
    orange: {
      tagBg: 'bg-orange-100',
      tagText: 'text-orange-700',
      bulletColor: 'text-orange-600',
    },
    pink: {
      tagBg: 'bg-pink-100',
      tagText: 'text-pink-700',
      bulletColor: 'text-pink-600',
    },
    gray: {
      tagBg: 'bg-gray-100',
      tagText: 'text-gray-700',
      bulletColor: 'text-gray-600',
    },
    dark: {
      tagBg: 'bg-zinc-800',
      tagText: 'text-zinc-100',
      bulletColor: 'text-zinc-400',
    },
  };
  return themes[theme as keyof typeof themes] || themes.cyan;
};

export default function Home() {
  const [editMode, setEditMode] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [coverData, setCoverData] = useState(INITIAL_COVER);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(INITIAL_GLOBAL_SETTINGS);
  const [slides, setSlides] = useState<SlideData[]>(INITIAL_SLIDES);
  const [endData, setEndData] = useState(INITIAL_END);

  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState(0); // 0=cover, 1-n=slides, n+1=end
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'idle'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleReset = () => {
    if (window.confirm('Tüm verileri silip varsayılan ayarlara dönmek istediğinize emin misiniz?')) {
      localStorage.removeItem('presentation-slides');
      localStorage.removeItem('presentation-cover');
      localStorage.removeItem('presentation-end');
      localStorage.removeItem('presentation-settings');

      setSlides(INITIAL_SLIDES);
      setCoverData(INITIAL_COVER);
      setEndData(INITIAL_END);
      setGlobalSettings(INITIAL_GLOBAL_SETTINGS);
      setCurrentSlide(0);
      window.location.reload(); // State temizliğini garantiye almak için
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedSlides = localStorage.getItem('presentation-slides');
        const savedCoverData = localStorage.getItem('presentation-cover');
        const savedEndData = localStorage.getItem('presentation-end');
        const savedGlobalSettings = localStorage.getItem('presentation-settings');

        if (savedSlides) setSlides(JSON.parse(savedSlides));
        if (savedCoverData) setCoverData(JSON.parse(savedCoverData));
        if (savedEndData) setEndData(JSON.parse(savedEndData));
        if (savedGlobalSettings) setGlobalSettings(JSON.parse(savedGlobalSettings));
      } catch (error) {
        console.error('LocalStorage yükleme hatası:', error);
      }
    };

    loadData();
  }, []);

  // Save global settings to localStorage
  useEffect(() => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('presentation-slides', JSON.stringify(slides));
      localStorage.setItem('presentation-cover', JSON.stringify(coverData));
      localStorage.setItem('presentation-end', JSON.stringify(endData));
      localStorage.setItem('presentation-settings', JSON.stringify(globalSettings));

      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString('tr-TR'));

      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setSaveStatus('idle');
    }
  }, [slides, coverData, endData, globalSettings]);

  const handlePrint = () => {
    setEditMode(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const updateSlide = <K extends keyof SlideData>(index: number, field: K, value: SlideData[K]) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const updateFeature = (slideIndex: number, featureIndex: number, value: string) => {
    const newSlides = [...slides];
    const newFeatures = [...newSlides[slideIndex].features];
    newFeatures[featureIndex] = value;
    newSlides[slideIndex] = { ...newSlides[slideIndex], features: newFeatures };
    setSlides(newSlides);
  };

  const addFeature = (slideIndex: number) => {
    const newSlides = [...slides];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      features: [...newSlides[slideIndex].features, 'Yeni Özellik']
    };
    setSlides(newSlides);
  };

  const removeFeature = (slideIndex: number, featureIndex: number) => {
    const newSlides = [...slides];
    const newFeatures = newSlides[slideIndex].features.filter((_, i) => i !== featureIndex);
    newSlides[slideIndex] = { ...newSlides[slideIndex], features: newFeatures };
    setSlides(newSlides);
  };

  const handleImageUpload = (slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide(slideIndex, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSlide = () => {
    const newSlide: SlideData = {
      id: slides.length + 1,
      tag: 'Yeni Sayfa',
      title: 'Başlık',
      description: 'Açıklama',
      features: ['Madde 1', 'Madde 2', 'Madde 3'],
      deviceType: 'iphone',
      theme: 'cyan',
      layout: 'left'
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Editor Mode */}
      {editMode ? (
        <div className="flex h-screen">
          {/* Left Panel - Editor */}
          <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-cyan-700">Sunum Yapıcı</h1>
                  {saveStatus !== 'idle' || lastSaved ? (
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                      {saveStatus === 'saving' ? 'Kaydediliyor...' : `Otomatik kaydedildi: ${lastSaved}`}
                    </div>
                  ) : null}
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-500">
                  {slides.length + 2} Toplam Sayfa
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Önizleme
                </Button>
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF İndir
                </Button>
              </div>
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <div className="px-6 py-2 border-b border-gray-100">
                <TabsList className="w-full">
                  <TabsTrigger value="edit" className="flex-1">
                    <Layout className="mr-2 h-4 w-4" />
                    Düzenle
                  </TabsTrigger>
                  <TabsTrigger value="pages" className="flex-1">
                    <List className="mr-2 h-4 w-4" />
                    Sayfalar
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="m-0">
                <div className="p-6 space-y-6">
                  {/* Global Settings */}
                  <Card className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Genel Ayarlar</h3>
                    <div className="space-y-3">
                      {/* ... existing global settings ... */}
                      <div>
                        <Label>Genel Tema</Label>
                        <Select
                          value={globalSettings.theme}
                          onValueChange={(value: GlobalSettings['theme']) => setGlobalSettings({ ...globalSettings, theme: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tema seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cyan">🔵 Mavi (Cyan)</SelectItem>
                            <SelectItem value="purple">🟣 Mor</SelectItem>
                            <SelectItem value="green">🟢 Yeşil</SelectItem>
                            <SelectItem value="orange">🟠 Turuncu</SelectItem>
                            <SelectItem value="pink">🩷 Pembe</SelectItem>
                            <SelectItem value="gray">⚪ Gri</SelectItem>
                            <SelectItem value="dark">⚫ Karanlık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Genel Arka Plan</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={globalSettings.customBackgroundColor || '#ffffff'}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, customBackgroundColor: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={globalSettings.customBackgroundColor || '#ffffff'}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, customBackgroundColor: e.target.value })}
                            placeholder="#RRGGBB"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showSlideCount"
                          checked={globalSettings.showSlideCount}
                          onChange={(e) => setGlobalSettings({ ...globalSettings, showSlideCount: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <Label htmlFor="showSlideCount">Slide Sayısını Göster</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showTOC"
                          checked={globalSettings.showTOC}
                          onChange={(e) => setGlobalSettings({ ...globalSettings, showTOC: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <Label htmlFor="showTOC">İçindekiler Göster</Label>
                      </div>
                      <div>
                        <Label>Gradyan</Label>
                        <Select
                          value={GRADIENTS.find(g => g.value === globalSettings.gradient)?.id || 'none'}
                          onValueChange={(id) => {
                            const gradient = GRADIENTS.find(g => g.id === id);
                            setGlobalSettings({ ...globalSettings, gradient: gradient?.value || '' });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Gradyan seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADIENTS.map((g) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>

                  {/* Slide Navigation */}
                  <Card className="p-4">
                    <Label className="text-sm mb-2">Düzenlenecek Bölüm</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="flex-1 text-center text-sm">
                        {currentSlide === 0 ? 'Kapak' : currentSlide === slides.length + 1 ? 'Bitiş' : `Slayt ${currentSlide}`}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.min(slides.length + 1, currentSlide + 1))}
                        disabled={currentSlide === slides.length + 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* Cover Page Editor */}
                  {currentSlide === 0 && (
                    <Card className="p-4 space-y-4">
                      {/* ... cover editor ... */}
                      <h3 className="text-lg font-semibold">Kapak Sayfası</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Başlık</Label>
                          <Input
                            value={coverData.title}
                            onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Açıklama</Label>
                          <Input
                            value={coverData.subtitle}
                            onChange={(e) => setCoverData({ ...coverData, subtitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Kurum/Firma</Label>
                          <Input
                            value={coverData.organization}
                            onChange={(e) => setCoverData({ ...coverData, organization: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Gradyan</Label>
                          <Select
                            value={GRADIENTS.find(g => g.value === coverData.gradient)?.id || 'none'}
                            onValueChange={(id) => {
                              const gradient = GRADIENTS.find(g => g.id === id);
                              setCoverData({ ...coverData, gradient: gradient?.value || '' });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Gradyan seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {GRADIENTS.map((g) => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Arka Plan Rengi</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={coverData.customBackgroundColor || '#ffffff'}
                              onChange={(e) => setCoverData({ ...coverData, customBackgroundColor: e.target.value, gradient: '' })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={coverData.customBackgroundColor || '#ffffff'}
                              onChange={(e) => setCoverData({ ...coverData, customBackgroundColor: e.target.value, gradient: '' })}
                              placeholder="#RRGGBB"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Slide Editors */}
                  {currentSlide > 0 && currentSlide <= slides.length && (
                    <Card className="p-4 space-y-4">
                      {/* ... slide editor ... */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Slayt {currentSlide}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeSlide(currentSlide - 1);
                            setCurrentSlide(Math.max(0, currentSlide - 1));
                          }}
                        >
                          Sil
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>Etiket</Label>
                          <Input
                            value={slides[currentSlide - 1].tag}
                            onChange={(e) => updateSlide(currentSlide - 1, 'tag', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Cihaz Tipi</Label>
                          <Select
                            value={slides[currentSlide - 1].deviceType || 'iphone'}
                            onValueChange={(value) => updateSlide(currentSlide - 1, 'deviceType', value as 'iphone' | 'macbook')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Cihaz seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iphone">📱 iPhone 17 Pro</SelectItem>
                              <SelectItem value="macbook">💻 MacBook Air</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Gradyan</Label>
                        <Select
                          value={GRADIENTS.find(g => g.value === slides[currentSlide - 1].gradient)?.id || 'none'}
                          onValueChange={(id) => {
                            const gradient = GRADIENTS.find(g => g.id === id);
                            updateSlide(currentSlide - 1, 'gradient', gradient?.value || '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Gradyan seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADIENTS.map((g) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Arka Plan Rengi</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={slides[currentSlide - 1].customBackgroundColor || '#ffffff'}
                            onChange={(e) => {
                              updateSlide(currentSlide - 1, 'customBackgroundColor', e.target.value);
                              updateSlide(currentSlide - 1, 'gradient', '');
                            }}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={slides[currentSlide - 1].customBackgroundColor || '#ffffff'}
                            onChange={(e) => {
                              updateSlide(currentSlide - 1, 'customBackgroundColor', e.target.value);
                              updateSlide(currentSlide - 1, 'gradient', '');
                            }}
                            placeholder="#RRGGBB"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Düzen (Görsel Konumu)</Label>
                        <Select
                          value={slides[currentSlide - 1].layout || 'left'}
                          onValueChange={(value) => updateSlide(currentSlide - 1, 'layout', value as 'left' | 'right')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Düzen seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">⬅️ Sol</SelectItem>
                            <SelectItem value="right">➡️ Sağ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Renk Teması</Label>
                        <Select
                          value={slides[currentSlide - 1].theme || 'cyan'}
                          onValueChange={(value) => updateSlide(currentSlide - 1, 'theme', value as SlideData['theme'])}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tema seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cyan">🔵 Cyan (Mavi)</SelectItem>
                            <SelectItem value="purple">🟣 Mor</SelectItem>
                            <SelectItem value="green">🟢 Yeşil</SelectItem>
                            <SelectItem value="orange">🟠 Turuncu</SelectItem>
                            <SelectItem value="pink">🩷 Pembe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Başlık</Label>
                        <Input
                          value={slides[currentSlide - 1].title}
                          onChange={(e) => updateSlide(currentSlide - 1, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Açıklama</Label>
                        <Textarea
                          value={slides[currentSlide - 1].description}
                          onChange={(e) => updateSlide(currentSlide - 1, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Özellikler</Label>
                        {slides[currentSlide - 1].features.map((feature, i) => (
                          <div key={i} className="flex gap-2 mt-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(currentSlide - 1, i, e.target.value)}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeFeature(currentSlide - 1, i)}
                            >
                              X
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addFeature(currentSlide - 1)}
                          className="mt-2 w-full"
                        >
                          + Madde Ekle
                        </Button>
                      </div>
                      <div>
                        <Label>Görsel Yükle ({slides[currentSlide - 1].deviceType === 'macbook' ? 'Web Ekranı' : 'Telefon Ekranı'})</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(currentSlide - 1, e)}
                          className="mt-2"
                        />
                        {slides[currentSlide - 1].image && (
                          <p className="text-xs text-green-600 mt-1">✓ Görsel yüklendi</p>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* End Page Editor */}
                  {currentSlide === slides.length + 1 && (
                    <Card className="p-4 space-y-4">
                      {/* ... end editor ... */}
                      <h3 className="text-lg font-semibold">Bitiş Sayfası</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Başlık</Label>
                          <Input
                            value={endData.title}
                            onChange={(e) => setEndData({ ...endData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Açıklama</Label>
                          <Textarea
                            value={endData.subtitle}
                            onChange={(e) => setEndData({ ...endData, subtitle: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>İletişim 1</Label>
                          <Input
                            value={endData.contact1}
                            onChange={(e) => setEndData({ ...endData, contact1: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>İletişim 2</Label>
                          <Input
                            value={endData.contact2}
                            onChange={(e) => setEndData({ ...endData, contact2: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Gradyan</Label>
                          <Select
                            value={GRADIENTS.find(g => g.value === endData.gradient)?.id || 'none'}
                            onValueChange={(id) => {
                              const gradient = GRADIENTS.find(g => g.id === id);
                              setEndData({ ...endData, gradient: gradient?.value || '' });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Gradyan seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {GRADIENTS.map((g) => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Arka Plan Rengi</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={endData.customBackgroundColor || '#ffffff'}
                              onChange={(e) => setEndData({ ...endData, customBackgroundColor: e.target.value, gradient: '' })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={endData.customBackgroundColor || '#ffffff'}
                              onChange={(e) => setEndData({ ...endData, customBackgroundColor: e.target.value, gradient: '' })}
                              placeholder="#RRGGBB"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Add Slide Button */}
                  <Button onClick={addSlide} variant="outline" className="w-full">
                    + Yeni Sayfa Ekle
                  </Button>
                </div>
                <div className="p-6 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    onClick={handleReset}
                  >
                    Tüm Verileri Temizle ve Sıfırla
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pages" className="m-0">
                <div className="p-4 space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">Bölümler</div>

                  {/* Kapak Sayfası List Item */}
                  <div
                    onClick={() => setCurrentSlide(0)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${currentSlide === 0 ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center text-white mr-3">
                      K
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Kapak Sayfası</div>
                      <div className="text-xs text-gray-500 truncate">{coverData.title}</div>
                    </div>
                  </div>

                  {/* Slaytlar List Items */}
                  {slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      onClick={() => setCurrentSlide(idx + 1)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${currentSlide === idx + 1 ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-600 mr-3 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-semibold flex items-center">
                          {slide.deviceType === 'iphone' ? '📱' : '💻'} {slide.tag}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{slide.title}</div>
                      </div>
                    </div>
                  ))}

                  {/* Bitiş Sayfası List Item */}
                  <div
                    onClick={() => setCurrentSlide(slides.length + 1)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${currentSlide === slides.length + 1 ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-white mr-3 font-bold">
                      B
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Bitiş Sayfası</div>
                      <div className="text-xs text-gray-500 truncate">{endData.title}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={addSlide} variant="outline" className="w-full text-xs h-8">
                      + Sayfa Ekle
                    </Button>
                  </div>
                </div>

                <div className="mt-auto p-4 text-center border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">
                    Copyright yemreeke.com yemreeke.dev
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <h3 className="text-xl text-gray-600 font-semibold flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Dinamik Önizleme
              </h3>

              {/* Preview of current slide */}
              {currentSlide === 0 && (
                <div
                  className={`${coverData.gradient || (!coverData.customBackgroundColor ? globalSettings.gradient : '') || 'bg-gradient-to-br from-cyan-500 to-cyan-600'} text-white p-16 rounded-lg shadow-xl`}
                  style={coverData.customBackgroundColor && !coverData.gradient ? { backgroundColor: coverData.customBackgroundColor } : (!coverData.gradient && !coverData.customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
                >
                  <div className="text-center space-y-8">
                    <h1 className="text-6xl font-bold">{coverData.title}</h1>
                    <p className="text-2xl opacity-90">{coverData.subtitle}</p>
                    <div className="mt-12 text-xl opacity-80">
                      {coverData.organization}
                    </div>
                    {globalSettings.showSlideCount && (
                      <div className="mt-8 text-lg opacity-75">
                        Topam {slides.length} Sayfa
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSlide > 0 && currentSlide <= slides.length && (
                <div
                  className={`${slides[currentSlide - 1].gradient || (!slides[currentSlide - 1].customBackgroundColor ? globalSettings.gradient : '') || 'bg-white'} p-12 rounded-lg shadow-xl`}
                  style={slides[currentSlide - 1].customBackgroundColor && !slides[currentSlide - 1].gradient ? { backgroundColor: slides[currentSlide - 1].customBackgroundColor } : (!slides[currentSlide - 1].gradient && !slides[currentSlide - 1].customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image Column */}
                    <div className={`flex justify-center print:justify-${slides[currentSlide - 1].layout === 'right' ? 'end' : 'start'} ${slides[currentSlide - 1].layout === 'right' ? 'lg:order-2' : ''}`}>
                      <div className={slides[currentSlide - 1].deviceType === 'macbook' ? 'scale-[0.55] lg:scale-[0.7] xl:scale-[0.85] origin-top' : ''}>
                        <DeviceMockup
                          type={slides[currentSlide - 1].deviceType || 'iphone'}
                          image={slides[currentSlide - 1].image}
                          placeholderText={slides[currentSlide - 1].deviceType === 'macbook' ? 'Web ekranı yükleyin' : 'Telefon ekranı yükleyin'}
                        />
                      </div>
                    </div>
                    {/* Text Column */}
                    <div className={`space-y-4 ${slides[currentSlide - 1].layout === 'right' ? 'lg:order-1' : ''}`}>
                      {(() => {
                        const themeColors = getThemeColors(globalSettings.theme);
                        return (
                          <>
                            <div className={`inline-block px-3 py-1 ${themeColors.tagBg} ${themeColors.tagText} rounded-full text-xs font-medium`}>
                              {slides[currentSlide - 1].tag}
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">{slides[currentSlide - 1].title}</h2>
                            <p className="text-lg text-gray-600">{slides[currentSlide - 1].description}</p>
                            <ul className="space-y-2 text-gray-700">
                              {slides[currentSlide - 1].features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                  <span className={`${themeColors.bulletColor} mr-2`}>•</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === slides.length + 1 && (
                <div
                  className={`${endData.gradient || (!endData.customBackgroundColor ? globalSettings.gradient : '') || 'bg-gradient-to-br from-cyan-500 to-cyan-600'} text-white p-16 rounded-lg shadow-xl`}
                  style={endData.customBackgroundColor && !endData.gradient ? { backgroundColor: endData.customBackgroundColor } : (!endData.gradient && !endData.customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
                >
                  <div className="text-center space-y-8">
                    <h2 className="text-5xl font-bold">{endData.title}</h2>
                    <p className="text-2xl opacity-90">{endData.subtitle}</p>
                    <div className="mt-12 space-y-4 text-lg opacity-80">
                      <p>{endData.contact1}</p>
                      <p>{endData.contact2}</p>
                    </div>
                  </div>
                </div>
              )}
            </div >
          </div >
        </div >
      ) : (
        /* Full Preview Mode for Print */
        <>
          <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenlemeye Dön
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Download className="mr-2 h-4 w-4" />
              PDF olarak İndir
            </Button>
          </div>

          {/* Cover Page */}
          <div
            className={`min-h-screen print:h-[210mm] print:w-[297mm] flex flex-col items-center justify-center p-8 text-white print:break-after-page overflow-hidden print-page print:scale-100 print:origin-center ${coverData.gradient || (!coverData.customBackgroundColor ? globalSettings.gradient : '') || 'bg-gradient-to-br from-cyan-500 to-cyan-600'}`}
            style={coverData.customBackgroundColor && !coverData.gradient ? { backgroundColor: coverData.customBackgroundColor } : (!coverData.gradient && !coverData.customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
          >
            <div className="text-center space-y-8">
              <h1 className="text-6xl mb-4 font-bold">{coverData.title}</h1>
              <p className="text-2xl opacity-90">{coverData.subtitle}</p>
              <div className="mt-12 text-xl opacity-80">
                {coverData.organization}
              </div>
              {globalSettings.showSlideCount && (
                <div className="mt-8 text-lg opacity-75">
                  Toplam {slides.length} Sayfa
                </div>
              )}
            </div>
          </div>

          {/* Slides */}
          {slides.map((slide, index) => {
            const themeColors = getThemeColors(globalSettings.theme);
            return (
              <div
                key={slide.id}
                className={`min-h-screen print:h-[210mm] print:w-[297mm] flex items-center justify-center p-8 lg:p-16 print:p-0 print:break-after-page overflow-hidden print-page print:scale-100 print:origin-center ${slide.gradient || (!slide.customBackgroundColor ? globalSettings.gradient : '') || 'bg-white'} ${slide.backgroundColor || ''}`}
                style={slide.customBackgroundColor && !slide.gradient ? { backgroundColor: slide.customBackgroundColor } : (!slide.gradient && !slide.customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
              >
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center print:gap-8 print:max-w-none print:px-12">
                  {/* Layout Logic for Full Preview */}
                  {slide.layout === 'right' ? (
                    <>
                      <div className="space-y-6 lg:order-1">
                        <div className={`inline-block px-4 py-2 ${themeColors.tagBg} ${themeColors.tagText} rounded-full text-sm font-medium`}>
                          {slide.tag}
                        </div>
                        <h2 className="text-5xl font-bold text-gray-900">{slide.title}</h2>
                        <p className="text-xl text-gray-600 leading-relaxed">{slide.description}</p>
                        <ul className="space-y-3 text-lg text-gray-700">
                          {slide.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className={`${themeColors.bulletColor} mr-3`}>•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-center print:justify-end lg:order-2">
                        <DeviceMockup
                          type={slide.deviceType || 'iphone'}
                          image={slide.image}
                          placeholderText={slide.deviceType === 'macbook' ? 'Web ekranı eklenecek' : 'Telefon ekranı eklenecek'}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center print:justify-start">
                        <DeviceMockup
                          type={slide.deviceType || 'iphone'}
                          image={slide.image}
                          placeholderText={slide.deviceType === 'macbook' ? 'Web ekranı eklenecek' : 'Telefon ekranı eklenecek'}
                        />
                      </div>
                      <div className="space-y-6">
                        <div className={`inline-block px-4 py-2 ${themeColors.tagBg} ${themeColors.tagText} rounded-full text-sm font-medium`}>
                          {slide.tag}
                        </div>
                        <h2 className="text-5xl font-bold text-gray-900">{slide.title}</h2>
                        <p className="text-xl text-gray-600 leading-relaxed">{slide.description}</p>
                        <ul className="space-y-3 text-lg text-gray-700">
                          {slide.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className={`${themeColors.bulletColor} mr-3`}>•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className={`min-h-screen print:h-[210mm] print:w-[297mm] flex flex-col items-center justify-center p-8 text-white overflow-hidden print-page ${endData.gradient || (!endData.customBackgroundColor ? globalSettings.gradient : '') || 'bg-gradient-to-br from-cyan-500 to-cyan-600'}`}
            style={endData.customBackgroundColor && !endData.gradient ? { backgroundColor: endData.customBackgroundColor } : (!endData.gradient && !endData.customBackgroundColor && globalSettings.customBackgroundColor && !globalSettings.gradient ? { backgroundColor: globalSettings.customBackgroundColor } : {})}
          >
            <div className="text-center space-y-8 max-w-4xl">
              <h2 className="text-5xl mb-4 font-bold">{endData.title}</h2>
              <p className="text-2xl opacity-90">{endData.subtitle}</p>
              <div className="mt-12 space-y-4 text-lg opacity-80">
                <p>{endData.contact1}</p>
                <p>{endData.contact2}</p>
              </div>
            </div>
          </div>

          <div className="py-12 bg-gray-50 text-center print:hidden border-t border-gray-100">
            <p className="text-gray-400 text-sm">
              Copyright yemreeke.com yemreeke.dev
            </p>
          </div>
          <style>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 0;
              }
              
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                margin: 0;
                padding: 0;
                height: auto !important;
                min-height: 0 !important;
              }
              
              .min-h-screen {
                min-height: auto !important;
                height: auto !important;
              }

              /* Sektör bazlı sayfa boyutlandırma */
              .print-page {
                page-break-after: always !important;
                break-after: page !important;
                height: 210mm !important;
                width: 297mm !important;
                min-height: 210mm !important;
                position: relative;
                overflow: hidden;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }

              /* Son sayfada break-after olmasın */
              .print-page:last-of-type {
                page-break-after: auto !important;
                break-after: auto !important;
              }

              /* İçeriği A4'e sığdırmak için ölçeklendir */
              .print-page > div {
                transform: scale(0.85);
                transform-origin: center center;
                width: 115% !important; 
                max-width: none !important;
              }

              /* Grid düzenini mobildeki gibi değil, yan yana (desktop) tut */
              .grid.lg\\:grid-cols-2 {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 2rem !important;
              }

              /* Yazdırma sırasında gereksiz boşlukları temizle */
              .p-8, .p-16, .lg\\:p-16 {
                padding: 0 !important;
              }

              /* Önizleme butonlarını gizle */
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </>
      )}
    </div >
  );
}
