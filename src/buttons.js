const {readFileSync} = require('original-fs');
const {writeFileSync} = require('original-fs');
const {ipcRenderer, app} = require('electron');
const loadBtn = document.getElementById('loadBtn');
const saveBtn = document.getElementById('saveBtn');
// const buttonDef = document.getElementById('defaultDir');
const path = require('path');
let configFileLocation = './Config.xml';

const storedConfigFileLocation = app && app.getPath('userData');
if (storedConfigFileLocation) {
    configFileLocation = storedConfigFileLocation;
}

const cheerio = require('cheerio')

let $;

const labelToCommentMap = {
    'Culture': 'Dil seçeneği',
    'Version': 'Versiyon Bilgisi',
    'LoginName': 'Versiyon Bilgisi',
    'SecurityDegree': 'Gizlilik Derecesi',
    'DatabaseHost': 'Veritabanı Host',
    'DatabasePort': 'Veritabanının çalıştığı Portu belirler',
    'DatabaseName': 'Veritabanı adını belirler',
    'DatabaseUsername': 'Veritabanı Kullanıcı Adını belirler',
    'DatabasePassword': 'Veritabanı Şifresini belirler',
    'PasswordExpirationPeriod': 'Şifre Geçerlilik Süresinin kontrol edileceği periyodu belirler.(Gün Cinsinden)',
    'LastLoginPeriod': 'Son Giriş Süresinin kontrol edileceği periyodu belirler.(Gün cinsinden)',
    'ExpirationWarningThreshold': 'Şifre geçerlilik süresininin sona ereceğini belirten uyarının gösterileceği kalan süreyi belirler.(Gün cinsinden)',
    'LockScreenThreshold': 'Herhangi bir aktivite gerçekleşmediği takdirde kilit ekranının açılacağı süreyi belirler.(Milisaniye cinsinden) base:540',
    'MaximumAdminCount': 'Maksimum yetkili kullanıcı sayısını belirler',
    'MaximumLoginAttemptCount': 'Maksimum hatalı giriş denemesi sayısını belirler.',
    'FailLoginBaseTimeout': 'Maksimum hatalı giriş denemesi sonucunda beklenilecek süreyi belirler.(Saniye cinsinden)',
    'FailLoginAddedTimeout': 'Maksimum hatalı giriş denemesi sonrası her hatalı girişte bekleme süresinin ne kadar artacağını belirler.(Saniye cinsinden)',
    'MaximumUserOperationRecordCount': 'Veritabanında saklanacak maksimum kullanıcı işlem kaydı sayısını belirler',
    'MaximumUserOperationRecordCountForPage': 'Arayüzde Kullanıcı İşlem Listesinde 1 sayfada gösterilecek kayıt sayısını belirler',
    'MaximumAlarmRecordCount': 'Veritabanında saklanacak maksimum alarm kaydı sayısını belirler',
    'MaximumAlarmRecordCountForPage': 'Arayüzde Alarm Listesinde 1 sayfada gösterilecek kayıt sayısını belirler',
    'HardenedIdentityNumberCheck': 'Yeni kullanıcı tanımlanırken TC kimlik numarasının tüm kurallara göre denetlenip denetlenmeyeceğini belirler. True / False',
    'IntegrationServiceUsername': 'MYWebIntegrationService kullanıcı adı',
    'IntegrationServicePassword': 'MYWebIntegrationService şifresi',
    'MyWebServiceConnectionCheckPeriod': 'MYWeb servisi ile MYWeb Entegrasyon yazılımı arasında bağlantı durumunun kontrol edileceği zaman aralığını belirler.(Dakika cinsinden)',
    'MyWebServiceRetryToConnectPeriod': 'MYWeb servisi ile MYWeb Entegrasyon yazılımı arasında başarısız bağlantı sonucunda bağlantının ne kadar sıklıkla tekrar deneneceğini belirler.(Dakika Cinsinden)',
    'CommandControlServerIP': 'Komuta kontrol birimleri ile bağlantı kurulacak IP adresini belirler',
    'CommandControlServerPort': 'Komuta kontrol birimleri ile bağlantı kurulacak Port numarasını belirler',
    'CommandControlServerMinPort': 'Komuta kontrol sunucusunun başlatılabileceği minimum portu belirler',
    'CommandControlServerMaxPort': 'Komuta kontrol sunucusunun başlatılabileceği maksimum portu belirler',
    'CommandControlServerUsername': 'Komuta kontrol sunucusunun başlatılabileceği minimum portu belirler. RijndaelCrypt ile şifrelenmelidir',
    'CommandControlServerPassword': 'Komuta kontrol sunucusunun başlatılabileceği maksimum portu belirler. RijndaelCrypt ile şifrelenmelidir',
    'ACOATOExpirationCheckPeriod': 'HGE ve HSKE verilerinin geçerlilik süresinin kontrol edileceği zaman aralığını belirler.(Saniye cinsinden)',
    'ATOFileExtension': 'HGE verilerinin yükleneceği dosyaların uzantısını belirler',
    'ACOFileExtension': 'HSKE verilerinin yükleneceği dosyaların uzantısını belirler',
    'NOTAMFileExtension': 'NOTAM verilerinin yükleneceği dosyaların uzantısını belirler',
    'NOTAMcheckInterval': 'NOTAM verilerinin MYS den sorgulanacağı dakika aralığını belirler',
    'NOTAMExpiredCheckInterval': 'NOTAM verilerinin geçerlilik durumunun kontrol edilme aralığını belirler. Saniye cinsindendir',
    'NOTAMDeleteCooldown': 'NOTAM verilerinin iptal edildikten sonra silinme işlemi için beklenen süreyi belirtir. Saniye cinsindendir',
    'NOTAMReplacedDeleteCooldown': 'NOTAM verilerinin iptal edildikten sonra silinme işlemi için beklenen süreyi belirtir. Saniye cinsindendir',
    'METEOcheckInterval': 'Meteonun kaç dakikada bir sorgulanacağını belirler',
    'METEOValidityTime': 'Meteonun kaç dakika geçerli sayılacağını belirler',
    'MeteoHost': 'Host Değerini belirler',
    'MeteoName': 'Name Değerini belirler',
    'MeteoPass': 'Password Değerini belirler',
    'MeteoPort': 'Port Değerini belirler',
    'MeteoSSH': 'SSH-Fingerprint Değerini belirler',
    'MeteoLocalPath': 'LocalPath Değerini belirler',
    'MeteoLocalDir': 'Meteo yerel dizin Değerini belirler',
    'MeteoRemotePath': 'RemotePath Değerini belirler',
    'MeteoRemoteMeteoPath': 'SFTP remote dizininnde oluşturulan filtreli Meteoların dizin değerini belirler',
    'DTEDcheckInterval': 'DTEDnun kaç dakikada bir sorgulanacağını belirler',
    'DTEDValidityTime': 'DTEDnun kaç saat geçerli sayılacağını belirler',
    'DTEDHost': 'Host Değerini belirler',
    'DTEDName': 'Name Değerini belirler',
    'DTEDPass': 'Password Değerini belirler',
    'DTEDPort': 'Port Değerini belirler',
    'DTEDSSH': 'SSH-Fingerprint Değerini belirler',
    'DTEDLocalPath': 'LocalPath Değerini belirler',
    'DTED0LocalDir': 'DTED0 yerel dizin Değerini belirler',
    'DTED1LocalDir': 'DTED1 yerel dizin Değerini belirler',
    'DTED2LocalDir': 'DTED2 yerel dizin Değerini belirler',
    'DTEDRemotePath': 'RemotePath Değerini belirler',
    'DTED0DrivePath': '\\\\128.20.16.8\\mapdata$\\04_YUKSEKLIK_VERILERI\\DTED_0\\DTED\\E000\\',
    'DTED1DrivePath': '',
    'DTED2DrivePath': '',
    'DTEDRemoteDTEDPath': 'SFTP remote dizininnde oluşturulan filtreli DTEDların dizin değerini belirler',
    'DTEDRemoteDTED0Path': 'SFTP remote dizininnde oluşturulan filtreli DTEDların dizin değerini belirler',
    'DTEDRemoteDTED1Path': 'SFTP remote dizininnde oluşturulan filtreli DTEDların dizin değerini belirler',
    'DTEDRemoteDTED2Path': 'SFTP remote dizininnde oluşturulan filtreli DTEDların dizin değerini belirler',
    'DTEDFileExtension': 'DTED verilerinin yükleneceği dosyaların uzantısını belirler',
};

function displayDatabase(xmlContent, xmlFileName) {

    // Clear existing content in .left-column and .right-column
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    // Load the XML into Cheerio
    $ = cheerio.load(xmlContent, {
        xmlMode: true,
        decodeEntities: false,
    });

    const xmlFileNameElement = document.getElementById('xmlFileName');
    xmlFileNameElement.textContent = `${xmlFileName}`;

    // Select the 'UserSettings' elements within 'Settings'
    const userSettings = $('Settings > UserSettings').children();
    userSettings.each((index, element) => {
        const key = userSettings.get(index).name;
        const value = $(element).text();
        const comment = labelToCommentMap[key] || ''; // Get the comment from the mapping


        const boxRow = document.createElement('div');

        boxRow.className = 'box-row';


        const label = document.createElement('label');
        label.className = 'hover-able-label';
        label.textContent = key;


        const hidden_content = document.createElement('span');
        hidden_content.className = 'hidden-content';
        hidden_content.textContent = comment;

        label.appendChild(hidden_content);

        const textArea = document.createElement('textarea');
        textArea.rows = 4;
        textArea.className = 'textarea'; // Remove the 'box-cell' class here
        textArea.value = value;
        textArea.id = 'textarea-' + key;
        textArea.setAttribute('data-label', key);

        boxRow.appendChild(label);

        const fileSelect = document.createElement('div');
        fileSelect.className = 'file-select';

        fileSelect.appendChild(textArea);


        if (isFilePath(value)) {
            textArea.classList.add('file-path');
            // Create a button to open the file path selector dialog
            const selectFileButton = document.createElement('button');
            selectFileButton.textContent = 'Select';
            selectFileButton.className = 'button-8'

            selectFileButton.addEventListener('click', () => {
                ipcRenderer.send('select-path-dialog', key);
            });

            fileSelect.appendChild(selectFileButton);
        }
        boxRow.appendChild(fileSelect);
        if (index % 2 === 0) {
            document.querySelector('.left-column').appendChild(boxRow);
        } else {
            document.querySelector('.right-column').appendChild(boxRow);
        }
    });
}


ipcRenderer.on('selected-path', (event, selectedPath, key) => {
    if (selectedPath) {
        const textArea = document.getElementById('textarea-' + key);
        textArea.value = selectedPath;
    }
});

saveBtn.addEventListener('click', () => {
    const textAreas = document.querySelectorAll('.textarea');

    // Update the values in Cheerio
    textAreas.forEach((textArea) => {
        const value = textArea.value;
        let associatedLabel = textArea.getAttribute('data-label');
        $('Settings > UserSettings').children(associatedLabel).text(value);
    });
    const updatedXmlContent = $.xml();
    ipcRenderer.send('save-file-dialog', updatedXmlContent);
});
loadBtn.addEventListener('click', () => {
    ipcRenderer.send('open-file-dialog');
});

//save file to selected directory
ipcRenderer.on('selected-saveFile', (event, filePath, updatedXmlContent) => {
    if (filePath && updatedXmlContent) {
        try {
            writeFileSync(filePath, updatedXmlContent, 'utf8');
            console.log('File saved successfully.');
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }
});
//load file
ipcRenderer.on('selected-file', (event, filePath) => {
    let xmlContent = readFileSync(filePath, 'utf8');
    const xmlFileName = path.basename(filePath)
    displayDatabase(xmlContent, xmlFileName);
})

/*buttonDef.addEventListener('click', () => {
    ipcRenderer.send('open-default-file-dialog')
})*/

/*ipcRenderer.on('selected-default-file', (event, filePath) => {
    configFileLocation = filePath;

    // Store the selected directory in app settings
    if (app) {
        app.setPath('userData', configFileLocation);
    }
    configFileLocation = configFileLocation + '/Config.xml'
    loadConfigFile(configFileLocation);
})*/

loadConfigFile(configFileLocation);

function loadConfigFile(filePath) {
    try {
        const defaultXmlContent = readFileSync(filePath, 'utf8');
        let xmlFileName = 'Config.xml';
        displayDatabase(defaultXmlContent, xmlFileName);
    } catch (error) {
        console.error('Error loading default Config.xml:', error);
    }
}



function isFilePath(value) {
    // Check if the value starts with "C:\"
    return value.toString().startsWith("C:\\");
}