function doPost(e) {
  try {
    // Kullanıcının verdiği E-Tablo linki
    var sheetUrl = "https://docs.google.com/spreadsheets/d/1NwvB2Z1dIGJp-60kUC-U65SjGETP1wtbv9zeAQP7-fM/edit?usp=sharing";
    var ss = SpreadsheetApp.openByUrl(sheetUrl);

    // Kaydedilecek sekmenin adı
    var sheetName = "Başvurular";
    var sheet = ss.getSheetByName(sheetName);

    // "Sekme aramasın, direkt kendi oluştursun" mantığı: Eğer sekme yoksa oluşturur.
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Formdan gelen veriler
    var data = e.parameter;

    // E-Tablonun sütun başlıklarını kontrol et
    var headers = [];
    if (sheet.getLastRow() === 0) {
      // Eğer sayfa tamamen boşsa, formdaki alanlara göre otomatik başlık oluşturur
      headers = Object.keys(data);
      headers.unshift('Tarih'); // En başa otomatik tarih sütunu ekler
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold"); // Başlıkları kalın yapar
    } else {
      // Sayfada zaten başlıklar varsa onları okur
      var lastColumn = sheet.getLastColumn();
      headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

      // Eğer HTML formuna sonradan yeni bir alan eklenmişse (örneğin e-posta), tabloya otomatik yeni sütun ekler
      var newKeys = Object.keys(data).filter(function (key) { return headers.indexOf(key) === -1; });
      if (newKeys.length > 0) {
        headers = headers.concat(newKeys);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      }
    }

    // Gelen form verilerini başlıklara göre eşleştirip sıraya dizer
    var row = headers.map(function (header) {
      if (header === 'Tarih') {
        return new Date(); // Tarih sütununa o anın tarihini ve saatini yazar
      }
      return data[header] || ''; // İlgili başlığa ait veriyi yazar, yoksa boş bırakır
    });

    // Hazırlanan satırı e-tablonun en altına ekler
    sheet.appendRow(row);

    // İşlem başarılı mesajı döndürür (HTML tarafı bunu bekler)
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Bir hata olursa hatayı döndürür
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
