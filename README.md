# Kitap Atlası

[Canlı site](https://karacaismail.github.io/kitapsxsil/)

Üç kitaplığı birleştiren Türkçe okuma kataloğu: **718 eser, 23 küme, 100 alt küme, 21 kategori**. Bir eser birden fazla kategori ve kaynak kümesinde bulunabilir.

## Arayüz

- **320 px öncelikli, akışkan genişlik; en fazla 960 px.** 960 px sabit bir genişlik değildir.
- Bütün metinlerde, rozetlerde, filtre seçeneklerinde ve form alanlarında en az **1 rem**.
- Varsayılan yazı tipi **Josefin Sans Variable**; normal ve italik Latin / Latin Extended dosyaları projeye gömülür. Türkçe karakterler uzak font servisine ihtiyaç duymadan görüntülenir.
- Mantine 9 bileşenleri; React Bits SpotlightCard ile sınırlı bir vurgu efekti.
- Kitap, Türkçe/özgün ad, yazar, çevirmen, yayınevi ve okuma notlarında Türkçe karakterlere duyarlı arama.
- Küme, alt küme, çoklu kategori, yazar, kaynak, kişisel okuma durumu, künye işareti, FT ödülü ve yıl filtreleri.
- Farklı filtre alanları birlikte uygulanır. Aynı alandaki seçimler varsayılan olarak **VEYA** ile birleşir; kategori ve kümeler için **VE** seçeneği vardır.
- FT ödül yılı ve durumu aynı ödül kaydında eşleşmek zorundadır. İlk yayın yılı ayrıca tutulur; bu bilgi yoksa yıl filtresinden geçmez.
- Etkin filtreleri tek tek kaldırma, bütününü temizleme, sıralama; 12/24/48 kitaplık sayfalar, sayfa numaraları, ilk/son sayfa ve doğrudan sayfaya gitme.
- Filtreler ve açık kitap URL'de saklanır; bağlantılar paylaşılabilir.
- Çeviri karşılaştırmaları, künye notları ve kaynak dosyanın tamamı. Kaynak tabloları etiketli Mantine kartları olarak gösterilir; dar ekranda alanlar alt alta, geniş ekranda iki sütunda yerleşir.
- Emojiler, anlamı korunarak düz metin etiketlerine dönüştürülür. Özgün arşiv kaynak dosyası korunur.
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

## Kişisel kitaplık ve okuma takibi

Sunucu ve hesap sistemi yoktur. `kitapatlasi:states:v2` anahtarıyla bu tarayıcıya kaydedilir. Aynı origin'deki eski `kitaps:states:v1` işaretleri bütün eski kitap anahtarlarından yeni eserlere aktarılır; eski depolama silinmez veya değiştirilmez. Kullanıcının yeni uygulamada kaldırdığı bir işaret, sonraki açılışta yeniden aktarılmaz. Başka tarayıcı veya cihazdaki işaretlere otomatik erişilemez.

“Satın aldım” işaretlenen eser katalog ve küme keşif sonuçlarından çıkar, üstte sabit duran **KİTAPLIĞIM** bölümüne geçer. Bu işareti kaldırmak kitabı keşif listelerine geri getirir. Kaynak üyelikleri, okuma sırası ve notlar korunur. Küme ve alt küme sayaçları satın alınmamış eserleri gösterir.

**Sıradaki 5 kitabım** bölümünde en fazla beş eser tutulur; yukarı/aşağı düğmeleriyle sıralanır. Başlama ve bitiş tarihi, kaldığın sayfa, toplam sayfa, “Neden okuyorum?” ve “Bundan neyi uygulayacağım?” notları `kitapatlasi:personal:v1` içinde saklanır. Sıradan çıkarma okuma kaydını silmez. “Okunuyor” ve “Okundu” ilk işaretlendiğinde ilgili tarih boşsa bugünün tarihi eklenir; kullanıcı değiştirebilir.

`Alınacak / Satın alındı` birbirini dışlar. `Okunuyor / Okundu / Ara verdim / Bıraktım` durumlarından aynı anda biri seçilebilir. `Önemli` bunlarla birlikte kullanılabilir. Kaynak dosyadaki “okunuyor” notu kişisel durum olarak atanmaz. Künye puanları kaynağın değerlendirmesidir; okuma işaretlerinden bağımsızdır.

Notlar bölümündeki kişisel yedek, işaretleri, sırayı ve bütün okuma kayıtlarını içerir. Sürüm 3 yedeğindeki sıra mevcut sıranın yerini alır; işaretler ve okuma kayıtları eser bazında birleştirilir. Eski işaret yedekleri sırayı ve notları değiştirmeden içe aktarılabilir. Kişisel notlar URL’ye veya ortak katalog dosyasına eklenmez.

## Geliştirme ve doğrulama

```sh
npm ci
npm run data       # Python 3 standart kitaplığı; ağı kullanmaz
npm test
npm run dev
npm run build
```

`src/library.js` filtreleme, sıralama, eski durum aktarımı ve URL kodlamasını arayüzden bağımsız tutar. Testler kaynak kayıtlarının korunmasını, Latin dışı başlıkları, çeviri eşlemelerini, çoklu kategorileri, küme kesişimini, FT yıl/durum eşleşmesini, Türkçe aramayı, durum aktarımını ve URL geri yüklemeyi doğrular.

Build, fontlar, CSS, JavaScript, birleşik katalog ve özgün veri arşivlerini `dist/index.html` dosyasında paketler; kapaklar `dist/covers/` altında siteyle birlikte sunulur ve sayfaya yaklaştıkça yüklenir. `npm run export`, kapakları da içine gömen, internetsiz açılabilen `../kitapsxsil.html` dosyasını ve tam JSON arşivini üretir. Dış kaynak bağlantıları internet gerektirir. GitHub Actions testleri ve build'i çalıştırıp `main` dalını GitHub Pages'e yayımlar.

## Lisanslar

React Bits SpotlightCard: David Haz, **MIT + Commons Clause** (`REACT-BITS-LICENSE.md`). React, Mantine, Tabler Icons, react-markdown ve remark-gfm: MIT. Josefin Sans: SIL Open Font License (`FONT-LICENSES.txt`).

## Türkiye baskılarının kapakları

116 eser için Türkçe baskı kapağı eklendi. `data/turkish-covers.json` her kapağın kaynak sayfasını, görsel adresini, ISBN, yazar ve yayınevini saklar. Görseller `public/covers/` içinde barındırılır. Kitapsepeti ürün metaverisinde dil, başlık ve yazar eşleşmesi aranır; belirli baskılar ayrıca yayınevi veya kitapçı sayfalarından elle eşleştirilir. Devam kitapları, uyarlamalar ve seriler aynı ad benzerliğiyle otomatik atanmaz.

Kapak bir eserin seçilen Türkçe baskısını temsil eder; kaynaktaki bütün çeviri önerileri aynı baskıya ait değildir. Ayrıntı paneli kapağın kendi yayınevini, ISBN ve kaynak bağlantısını gösterir. Eşleşmeyen eserlerde açıkça yer tutucu gösterilir; bu durum Türkçe baskısının bulunmadığı anlamına gelmez. Eski Open Library kimlikleri özgün arşivde korunur ve Türkçe kapak olarak kullanılmaz.

`fetch-turkish-covers.py` isteğe bağlı araştırma aracıdır; `requests` ve `beautifulsoup4` gerektirir. Build sırasında ağdan kapak aramaz. Yayınevi görsellerinin hakları ilgili hak sahiplerine aittir.

## Okuma amacı ve kitap keşfi

Her eserde “Ne için okumalıyım?”, gerekçeli ön okuma ve devam önerileri bulunur. `data/reading-guides.json` içinde 112 kitaba özel amaç, 21 konu rotası ve 18 eser için özel önce/sonra bağlantıları tutulur. Diğer eserlerde kaynak notu veya açıkça **konuya göre öneri** olarak etiketlenen amaç gösterilir; bu, 718 eserin tamamının ayrı ayrı içerik incelemesi yapıldığı anlamına gelmez. Okuma sırası editoryal bir öneridir; kaynak kümesine üyelik zorunlu önkoşul sayılmaz.

Önerilen kitaplar aynı ayrıntı panelinde açılır; önceki kitaba dönülebilir. Benzer kitaplarda konu veya kaynak kümesi seçilir. Seçilen kümenin tüm kitaplarına “4 kitap daha göster” ile ulaşılır. Satın alınanlar keşif önerilerinden çıkar; ön/son okuma rotasında ise sahiplik işaretiyle görünür, çünkü sahip olmak okumuş olmak anlamına gelmez.

Kartın kapağında yıldızın altında bulunan kitap simgesi “Satın aldım” işlemini yapar. Erişilebilir adı, açıklama balonu, en az 44 px hedef alanı ve geri alma bildirimi bulunur.

## Çeviri doğrulamasının kapsamı

`data/edition-verification.json` 19 eserin baskı kontrolünü kaydeder: **17 çevirmen kaydı yayıneviyle doğrulandı**, bir kayıtta yayınevinin çeviri editörleri doğrulandı (Sistemlerle Düşünmek), bir kayıtta kitapçı künyesi ikinci kontrol bekliyor (Rekabet Stratejisi). Diğer eserlerde çevirmen doğrulaması tamamlanmadığı açıkça yazılır. İsmi doğrulamak, çevirinin kalitesini karşılaştırmalı olarak incelemek değildir; otomatik “en iyi çevirmen” puanı üretilmez.

Budala’nın İletişim ve İvan İlyiç’in Ölümü’nün İş Bankası baskıları için arşivdeki yanlış çevirmen eşleşmeleri düzeltildi. Altı kapak seçimi, doğrulanan baskının ISBN’siyle yeniden eşleştirildi. Eski kayıtlar değiştirilmeden, “Arşivdeki çeviri ve baskı notları” içinde korunur. Kaynağın sayısal güven puanları kitap ayrıntısında kalite ölçütü olarak gösterilmez; özgün veri arşivinde saklanır.

Her eserde baskı/ISBN, kaynak dil, tam metin, çevirmenin alan deneyimi, örnek metin karşılaştırması ve editoryal destek için seçim ölçütleri bulunur. Arama doğrulanmış çevirmen ve ISBN alanlarını da kapsar.
