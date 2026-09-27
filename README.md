# Kitap Atlası

[Canlı site](https://karacaismail.github.io/kitapsxsil/)

Üç kitaplığı birleştiren Türkçe okuma kataloğu: **718 eser, 23 küme, 100 alt küme, 21 kategori**. Bir eser birden fazla kategori ve kaynak kümesinde bulunabilir.

## Arayüz

- **320 px öncelikli, akışkan genişlik; en fazla 960 px.** 960 px sabit bir genişlik değildir.
- Bütün metinlerde, rozetlerde, filtre seçeneklerinde ve form alanlarında en az **1 rem**.
- Mantine 9 bileşenleri; React Bits SpotlightCard ile sınırlı bir vurgu efekti.
- Kitap, Türkçe/özgün ad, yazar, çevirmen, yayınevi ve okuma notlarında Türkçe karakterlere duyarlı arama.
- Küme, alt küme, çoklu kategori, yazar, kaynak, kişisel okuma durumu, künye işareti, FT ödülü ve yıl filtreleri.
- Farklı filtre alanları birlikte uygulanır. Aynı alandaki seçimler varsayılan olarak **VEYA** ile birleşir; kategori ve kümeler için **VE** seçeneği vardır.
- FT ödül yılı ve durumu aynı ödül kaydında eşleşmek zorundadır. İlk yayın yılı ayrıca tutulur; bu bilgi yoksa yıl filtresinden geçmez.
- Etkin filtreleri tek tek kaldırma, bütününü temizleme, sıralama ve 24 kitaplık sayfalama.
- Filtreler ve açık kitap URL'de saklanır; bağlantılar paylaşılabilir.
- Çeviri karşılaştırmaları, künye notları ve kaynak dosyanın tamamı.
- Kişisel işaretleri yedekleme / içe aktarma ve bütün veri arşivini indirme.

## Birleştirilen kaynaklar

| Girdi | Korunan kapsam |
| --- | --- |
| Kitap Atlası v1 | 619 küme üyeliği, 565 farklı eser ve ayrıca iki başlangıç rehberi |
| Kullanıcının `okuma-kumeleri.html` dosyası | 52 kitap; 8 seçkinin amaç, ölçüt, değerlendirme ve kitap notları |
| [Kitaps](https://karacaismail.github.io/kitaps/) | 170 künye kaydı; çevirmen, yayınevi, kapak kimliği, puan gerekçesi, alternatif çeviri, durumlar ve tam `kitaplar.md` |

Kaynak dosyalar `data/sources/` altında değiştirilmeden saklanır. Yerel HTML'nin gömülü veri sabitleri `okuma-kumeleri.json` olarak çıkarılmıştır. Kaynak uygulamanın kodu çalıştırılarak veri çıkarılmamıştır.

Bir eserin farklı adları eşleştirilir; baskı ve çeviri kayıtları kaybolmadan `editions` altında korunur. Edebî uyarlamalar ve derlemeler ayrı tutulur. Kitaps'taki ayrı metinlerde geçen Oscar Wilde çeviri karşılaştırmaları ve anlatı içindeki küme ilişkileri de kataloğa eklenmiştir. Kaynak kayıtlarındaki farklı değerlendirmeler birbirinin üzerine yazılmaz.

Kategori etiketleri bu katalog için düzenlenmiştir; özgün kaynakların kategori iddiası değildir. FT etiketleri `data/ft-categories.json` içinde yıl ve kitap sırasıyla tutulur. Diğer etiketler konu grupları ve açık kitap eşlemelerinden üretilir. Kaynakların tam metin notları korunur; kitaplardaki telifli metinler çoğaltılmaz.

FT verisi **26 Eylül 2026** arşiv görünümüdür. Birleşik katalog **28 Eylül 2026** tarihinde hazırlanmıştır. FT 2026 kayıtları o arşivde uzun liste olarak işaretlidir. Yayın yılı yalnızca verilen kayıtta varsa gösterilir; ödül yılı yayın yılı sayılmaz.

### İlk atlasın kaynakları

- [TIME 25](https://content.time.com/time/specials/packages/completelist/0,29569,2086680,00.html)
- [The Personal MBA 99](https://personalmba.com/best-business-books/)
- [Financial Times ödül arşivi](https://ig.ft.com/sites/business-book-award/)
- Five Books: [Thomas Hellmann](https://fivebooks.com/best-books/entrepreneurship-thomas-hellmann/), [Seth Godin](https://fivebooks.com/best-books/marketing-seth-godin/), [Matt Abrahams](https://fivebooks.com/best-books/communication-matt-abrahams/)
- 100 Best 2016: [yazar listesi](https://toddsattersten.com/what-to-read/), [yayıncı](https://www.penguinrandomhouse.com/books/536326/the-100-best-business-books-of-all-time-by-jack-covert-and-todd-sattersten-with-sally-haldorson/), [yayıncının kitap önizlemesi](https://www.everand.com/book/769198057/The-100-Best-Business-Books-of-All-Time-What-They-Say-Why-They-Matter-and-How-They-Can-Help-You)
- [MIT Sloan 15.902 Güz 2006](https://ocw.mit.edu/courses/15-902-strategic-management-i-fall-2006/pages/readings/)

## Okuma işaretleri

Sunucu ve hesap sistemi yoktur. `kitapatlasi:states:v2` anahtarıyla bu tarayıcıya kaydedilir. Aynı origin'deki eski `kitaps:states:v1` işaretleri bütün eski kitap anahtarlarından yeni eserlere aktarılır; eski depolama silinmez veya değiştirilmez. Kullanıcının yeni uygulamada kaldırdığı bir işaret, sonraki açılışta yeniden aktarılmaz. Başka tarayıcı veya cihazdaki işaretlere otomatik erişilemez.

`Alınacak / Satın alındı` ve `Okunuyor / Okundu` birbirini dışlar. `Önemli` bunlarla birlikte kullanılabilir. Kaynak dosyadaki “okunuyor” notu kişisel durum olarak atanmaz. Künye puanları kaynağın değerlendirmesidir; okuma işaretlerinden bağımsızdır.

## Geliştirme ve doğrulama

```sh
npm ci
npm run data       # Python 3 standart kitaplığı; ağı kullanmaz
npm test
npm run dev
npm run build
```

`src/library.js` filtreleme, sıralama, eski durum aktarımı ve URL kodlamasını arayüzden bağımsız tutar. Testler kaynak kayıtlarının korunmasını, Latin dışı başlıkları, çeviri eşlemelerini, çoklu kategorileri, küme kesişimini, FT yıl/durum eşleşmesini, Türkçe aramayı, durum aktarımını ve URL geri yüklemeyi doğrular.

Build, fontlar, CSS, JavaScript, birleşik katalog ve özgün veri arşivlerini **tek `dist/index.html` dosyasında** paketler. Yerel HTML internetsiz açılır; dış kaynak bağlantıları internet gerektirir. GitHub Actions testleri ve build'i çalıştırıp `main` dalını GitHub Pages'e yayımlar.

## Lisanslar

React Bits SpotlightCard: David Haz, **MIT + Commons Clause** (`REACT-BITS-LICENSE.md`). React, Mantine, Tabler Icons, react-markdown ve remark-gfm: MIT. DM Sans ve Newsreader: SIL Open Font License (`FONT-LICENSES.txt`).
