const express = require("express");
const app = express();
const fs = require("fs");
const moment = require("moment"); // Menambahkan modul moment untuk bekerja dengan tanggal

app.use(express.json());

const apiKeysFilePath = "apikey.json";

function saveApiKeysToFile() {
  fs.writeFileSync(apiKeysFilePath, JSON.stringify(apiKeys, null, 2), "utf8");
}

function loadApiKeysFromFile() {
  try {
    const fileData = fs.readFileSync(apiKeysFilePath);
    apiKeys = JSON.parse(fileData);
  } catch (err) {
    console.error("Gagal memuat data API keys:", err);
  }
}

let apiKeys = [];
loadApiKeysFromFile();
let visitkey = 0;

app.get("/generate/:days/:key", (req, res) => {
  const { key, days } = req.params;

  if (!key || !days) {
    return res
      .status(400)
      .json({ message: "API key dan jumlah hari diperlukan." });
  }

  const existingKey = apiKeys.find((apiKey) => apiKey.key === key);
  if (existingKey) {
    return res.status(409).json({ message: "API key sudah ada." });
  }

  const expirationDays = parseInt(days);
  if (isNaN(expirationDays) || expirationDays <= 0) {
    return res
      .status(400)
      .json({ message: "Jumlah hari harus menjadi bilangan bulat positif." });
  }

  const newApiKey = {
    key,
    createdAt: moment().toISOString(),
    expiresAt: moment().add(expirationDays, "days").toISOString(),
  };

  apiKeys.push(newApiKey);
  saveApiKeysToFile();

  return res.status(201).json({ message: "API key berhasil dibuat." });
});
/*
app.get('/generate30/:key', (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: 'API key diperlukan.' });
  }

  const existingKey = apiKeys.find(apiKey => apiKey.key === key);
  if (existingKey) {
    return res.status(409).json({ message: 'API key sudah ada.' });
  }

  const newApiKey = {
    key,
    createdAt: moment().toISOString(), // Tanggal pembuatan API key
    expiresAt: moment().add(30, 'days').toISOString(), // Tanggal kedaluwarsa setelah 30 hari
  };

  apiKeys.push(newApiKey);
  saveApiKeysToFile();

  return res.status(201).json({ message: 'API key berhasil dibuat.' 
});
});

app.get('/generate14/:key', (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: 'API key diperlukan.' });
  }

  const existingKey = apiKeys.find(apiKey => apiKey.key === key);
  if (existingKey) {
    return res.status(409).json({ message: 'API key sudah ada.' });
  }

  const newApiKey = {
    key,
    createdAt: moment().toISOString(), // Tanggal pembuatan API key
    expiresAt: moment().add(14, 'days').toISOString(), // Tanggal kedaluwarsa setelah 30 hari
  };

  apiKeys.push(newApiKey);
  saveApiKeysToFile();

  return res.status(201).json({ message: 'API key berhasil dibuat.' });
});

app.get('/generate7/:key', (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: 'API key diperlukan.' });
  }

  const existingKey = apiKeys.find(apiKey => apiKey.key === key);
  if (existingKey) {
    return res.status(409).json({ message: 'API key sudah ada.' });
  }

  const newApiKey = {
    key,
    createdAt: moment().toISOString(), // Tanggal pembuatan API key
    expiresAt: moment().add(7, 'days').toISOString(), // Tanggal kedaluwarsa setelah 30 hari
  };

  apiKeys.push(newApiKey);
  saveApiKeysToFile();

  return res.status(201).json({ message: 'API key berhasil dibuat.' 
});
});
*/
app.get("/remove/:key", (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: "API key diperlukan." });
  }

  const keyIndex = apiKeys.findIndex((apiKey) => apiKey.key === key);

  if (keyIndex !== -1) {
    // Menghapus key dari array
    const deletedKey = apiKeys.splice(keyIndex, 1)[0];

    saveApiKeysToFile();

    return res
      .status(200)
      .json({ message: "API key berhasil dihapus.", deletedKey });
  } else {
    return res.status(404).json({ message: "API key tidak ditemukan." });
  }
});

app.get("/apikeys/:key", (req, res) => {
  const { key } = req.params;

  visitkey++;
  console.log(`[ ${visitkey} ] ${req.url}`);

  if (key) {
    const apiKeyInfo = apiKeys.find((apiKey) => apiKey.key === key);

    if (apiKeyInfo && moment(apiKeyInfo.expiresAt).isAfter(moment())) {
      return res
        .status(200)
        .json({ message: "API key valid.", expire: apiKeyInfo.expiresAt });
    } else {
      return res
        .status(200)
        .json({ message: "API key tidak valid atau telah kedaluwarsa." });
    }
  }
});

app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
