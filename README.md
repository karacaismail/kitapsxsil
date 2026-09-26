# Kitap Atlası

Yönetim, strateji ve işletme okumalarını kaynaklarına göre kümeleyen Türkçe kitap kataloğu.

**Canlı site:** https://karacaismail.github.io/kitapsxsil/

## Kapsam

| Küme | Kitap | Alt küme |
| --- | ---: | ---: |
| TIME (2011) | 25 | 1 |
| The Personal MBA | 99 | 26 |
| Financial Times (2005–2026) | 338 | 22 |
| Five Books: metinde adı geçen üç uzman | 15 | 3 |
| The 100 Best Business Books of All Time (2016) | 100 | 11 |
| MIT Sloan 15.902 (Güz 2006), kitaplar | 27 | 4 |
| Metindeki çekirdek seçki | 12 | 2 |
| Metindeki yakın vade önerisi | 3 | 3 |

619 küme üyeliği; aynı kitap birden fazla kümede bulunabilir. PMBA ve 100 Best rehber kitapları ayrıca gösterilir ve bu sayılara dahil değildir. Kaynaklar 26 Eylül 2026 tarihinde kontrol edildi. FT 2026 kayıtları kaynak arşivde uzun liste durumundadır. Kitapların içerikleri çoğaltılmamıştır; bibliyografik kayıtlar ve kaynak bağlantıları verilir.

## Kaynaklar

- [TIME tam seçki](https://content.time.com/time/specials/packages/completelist/0,29569,2086680,00.html)
- [Personal MBA resmî liste](https://personalmba.com/best-business-books/)
- [FT ödül arşivi](https://ig.ft.com/sites/business-book-award/)
- Five Books: [Thomas Hellmann](https://fivebooks.com/best-books/entrepreneurship-thomas-hellmann/), [Seth Godin](https://fivebooks.com/best-books/marketing-seth-godin/), [Matt Abrahams](https://fivebooks.com/best-books/communication-matt-abrahams/)
- [100 Best: yazarın listesi](https://toddsattersten.com/what-to-read/), [2016 baskısı](https://www.penguinrandomhouse.com/books/536326/the-100-best-business-books-of-all-time-by-jack-covert-and-todd-sattersten-with-sally-haldorson/), [yayıncı tarafından sunulan 2016 önizlemesi](https://www.everand.com/book/769198057/The-100-Best-Business-Books-of-All-Time-What-They-Say-Why-They-Matter-and-How-They-Can-Help-You)
- [MIT ders okuma listesi](https://ocw.mit.edu/courses/15-902-strategic-management-i-fall-2006/pages/readings/)

100 Best için yazarın web listesindeki 99 kayıt, 2016 baskısının içindekiler bölümüyle karşılaştırıldı. Web listesinden eksik olan **The Effective Executive** eklendi. Perakende sitesindeki güncel ürün koleksiyonu, 2016 seçkisinin yerine kullanılmadı.

## Geliştirme

```sh
npm ci
npm run dev
npm run build
```

React 19, Mantine 9, Vite ve React Bits SpotlightCard kullanılır. `npm run build`, CSS, JavaScript, katalog ve fontları **tek `dist/index.html` dosyasında** paketler. Dosya internetsiz olarak da açılabilir; dış kaynak bağlantıları internet gerektirir. Sunucu, analitik ve hesap sistemi yoktur.

GitHub Actions, main dalına gönderilen değişiklikleri GitHub Pages'e yayımlar.

## Bileşen ve font lisansları

- [React Bits SpotlightCard](https://reactbits.dev/components/spotlight-card): David Haz, MIT + Commons Clause. Lisans `REACT-BITS-LICENSE.md` dosyasındadır.
- React, Mantine ve Tabler Icons: MIT.
- DM Sans ve Newsreader: SIL Open Font License, Fontsource aracılığıyla yerel paketlenir.
