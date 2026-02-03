// Generierte Mensen-Struktur basierend auf API-Daten
// Erstellt am: 2026-02-02

export type Canteen = {
  id: string;
  name: string;
  fullName: string;
  address: string;
  hasMenu: boolean;
};

export type University = {
  id: string;
  name: string;
  canteens: Canteen[];
};

export const UNIVERSITIES: University[] = [
  {
    "id": "htw",
    "name": "Hochschule für Technik und Wirtschaft Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f80",
        "name": "HTW Treskowallee",
        "fullName": "Mensa HTW Treskowallee",
        "address": "Treskowallee 8, 10318",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f81",
        "name": "HTW Wilhelminenhof",
        "fullName": "Mensa HTW Wilhelminenhof",
        "address": "Wilhelminenhofstraße 75 A, (Gebäude",
        "hasMenu": false
      },
      {
        "id": "655ff175136d3b580c970f92",
        "name": "HTW Wilhelminenhof",
        "fullName": "Mensa-Backshop HTW Wilhelminenhof",
        "address": "Wilhelminenhofstraße 75 A, 12459",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "hwr",
    "name": "Hochschule für Wirtschaft und Recht Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f93",
        "name": "HWR Badensche Straße",
        "fullName": "Mensa HWR Badensche Straße",
        "address": "Badensche Str. 51, 10825",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f94",
        "name": "HWR Alt-Friedrichsfelde",
        "fullName": "Mensa-Backshop HWR Alt-Friedrichsfelde",
        "address": "Alt-Friedrichsfelde 60, (Haus",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "hu",
    "name": "Humboldt-Universität zu Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f82",
        "name": "Charité Zahnklinik",
        "fullName": "Mensa Charité Zahnklinik",
        "address": "Aßmannshauser Str. 2-6, 14197",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f83",
        "name": "HU Süd",
        "fullName": "Mensa HU Süd",
        "address": "Unter den Linden 6, 10117",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f84",
        "name": "Charité Zahnklinik",
        "fullName": "Mensa-Späti Charité Zahnklinik",
        "address": "Aßmannshauser Str. 2-6, 14197",
        "hasMenu": false
      },
      {
        "id": "655ff176136d3b580c970f95",
        "name": "HU Nord",
        "fullName": "Mensa HU Nord",
        "address": "Hannoversche Straße 7, 10115",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970f96",
        "name": "HU Oase Adlershof",
        "fullName": "Mensa HU Oase Adlershof",
        "address": "Rudower Chaussee 25, Haus",
        "hasMenu": false
      },
      {
        "id": "655ff176136d3b580c970f97",
        "name": "HU „c.t.“",
        "fullName": "Mensa-Backshop HU „c.t.“",
        "address": "Unter den Linden 6, 10117",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970f98",
        "name": "HU Oase Adlershof",
        "fullName": "Mensa-Backshop HU Oase Adlershof",
        "address": "Rudower Chaussee 25, 12489",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "fu",
    "name": "Freie Universität Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f88",
        "name": "FU Herrenhaus Düppel",
        "fullName": "Mensa FU Herrenhaus Düppel",
        "address": "Oertzenweg 19b, 14163",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f89",
        "name": "FU I Shokudō",
        "fullName": "Mensa FU I Shokudō",
        "address": "Van't-Hoff-Str. 6, 14195",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f8a",
        "name": "FU II",
        "fullName": "Mensa FU II",
        "address": "Otto-von-Simson-Straße 26, 14195",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f8b",
        "name": "FU Koserstraße",
        "fullName": "Mensa FU Koserstraße",
        "address": "Koserstraße 20, 14195",
        "hasMenu": false
      },
      {
        "id": "655ff175136d3b580c970f8c",
        "name": "FU Lankwitz Malteserstraße",
        "fullName": "Mensa FU Lankwitz Malteserstraße",
        "address": "Malteserstraße 74, 12249",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f8d",
        "name": "FU Pharmazie",
        "fullName": "Mensa FU Pharmazie",
        "address": "Königin-Luise-Str. 2, 14195",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f8e",
        "name": "FU Rechtswissenschaften",
        "fullName": "Mensa-Backshop FU Rechtswissenschaften",
        "address": "Van't-Hoff-Str. 8, 14195",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f8f",
        "name": "Shokudō (FU I)",
        "fullName": "Mensa-Späti Shokudō (FU I)",
        "address": "Van't-Hoff-Str. 6, 14195",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "tu",
    "name": "Technische Universität Berlin",
    "canteens": [
      {
        "id": "655ff176136d3b580c970f9d",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970f9e",
        "name": "TU Marchstraße",
        "fullName": "Mensa TU Marchstraße",
        "address": "Marchstraße 23, 10587",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970f9f",
        "name": "TU Veggie 2.0 – Die vegane Mensa",
        "fullName": "Mensa TU Veggie 2.0 – Die vegane Mensa",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970fa0",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa-Backshop TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970fa1",
        "name": "TU Wetterleuchten",
        "fullName": "Mensa-Backshop TU Wetterleuchten",
        "address": "Straße des 17. Juni 135, 10623",
        "hasMenu": true
      },
      {
        "id": "664006eb0489751ef00c9ebd",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa-Späti TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "charite",
    "name": "Charité - Universitätsmedizin Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f82",
        "name": "Charité Zahnklinik",
        "fullName": "Mensa Charité Zahnklinik",
        "address": "Aßmannshauser Str. 2-6, 14197",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f84",
        "name": "Charité Zahnklinik",
        "fullName": "Mensa-Späti Charité Zahnklinik",
        "address": "Aßmannshauser Str. 2-6, 14197",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "bht",
    "name": "Berliner Hochschule für Technik",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f7d",
        "name": "BHT Luxemburger Straße",
        "fullName": "Mensa BHT Luxemburger Straße",
        "address": "Luxemburger Straße 9, 13353",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f7e",
        "name": "BHT Luxemburger Straße",
        "fullName": "Mensa-Backshop BHT Luxemburger Straße",
        "address": "Luxemburger Straße 9, 13353",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f7f",
        "name": "BHT Haus Grashof",
        "fullName": "Mensa-Späti BHT Haus Grashof",
        "address": "Luxemburger Straße 10, 13353",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "ash",
    "name": "Alice Salomon Hochschule Berlin",
    "canteens": [
      {
        "id": "68db1dfadcae06321770ec2b",
        "name": "ASH Berlin",
        "fullName": "Mensa ASH Berlin",
        "address": "Kokoschkaplatz 8a, 12627",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "udk",
    "name": "Universität der Künste Berlin",
    "canteens": [
      {
        "id": "655ff176136d3b580c970f9d",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970f9f",
        "name": "TU Veggie 2.0 – Die vegane Mensa",
        "fullName": "Mensa TU Veggie 2.0 – Die vegane Mensa",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970fa0",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa-Backshop TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": true
      },
      {
        "id": "655ff176136d3b580c970fa1",
        "name": "TU Wetterleuchten",
        "fullName": "Mensa-Backshop TU Wetterleuchten",
        "address": "Straße des 17. Juni 135, 10623",
        "hasMenu": true
      },
      {
        "id": "664006eb0489751ef00c9ebd",
        "name": "TU Hardenbergstraße",
        "fullName": "Mensa-Späti TU Hardenbergstraße",
        "address": "Hardenbergstraße 34, 10623",
        "hasMenu": false
      }
    ]
  },
  {
    "id": "khb",
    "name": "Weißensee Kunsthochschule Berlin",
    "canteens": [
      {
        "id": "655ff176136d3b580c970fa2",
        "name": "KHS Weißensee",
        "fullName": "Mensa KHS Weißensee",
        "address": "Bühringstraße 20, 13086",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "ehb",
    "name": "Evangelische Hochschule Berlin",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f86",
        "name": "EHB Teltower Damm",
        "fullName": "Mensa EHB Teltower Damm",
        "address": "Teltower Damm 118 - 122, 14167",
        "hasMenu": true
      },
      {
        "id": "655ff175136d3b580c970f87",
        "name": "EHB Teltower Damm",
        "fullName": "Mensa-Späti EHB Teltower Damm",
        "address": "Teltower Damm 118 - 122, 14167",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "khsb",
    "name": "Katholische Hochschule für Sozialwesen Berlin",
    "canteens": [
      {
        "id": "655ff176136d3b580c970f9a",
        "name": "KHSB",
        "fullName": "Mensa KHSB",
        "address": "Köpenicker Allee 39 - 57, 10318",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "hfs",
    "name": "Hochschule für Schauspielkunst Ernst Busch",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f91",
        "name": "HfS Ernst Busch",
        "fullName": "Mensa HfS Ernst Busch",
        "address": "Zinnowitzer Straße 11, 10115",
        "hasMenu": true
      }
    ]
  },
  {
    "id": "hsap",
    "name": "Hochschule für Soziale Arbeit und Pädagogik",
    "canteens": [
      {
        "id": "655ff175136d3b580c970f81",
        "name": "HTW Wilhelminenhof",
        "fullName": "Mensa HTW Wilhelminenhof",
        "address": "Wilhelminenhofstraße 75 A, (Gebäude G)",
        "hasMenu": false
      }
    ]
  }
];


// Statistik:
// Hochschule für Technik und Wirtschaft Berlin: 3 Mensen
// Hochschule für Wirtschaft und Recht Berlin: 2 Mensen
// Humboldt-Universität zu Berlin: 7 Mensen
// Freie Universität Berlin: 8 Mensen
// Technische Universität Berlin: 6 Mensen
// Charité - Universitätsmedizin Berlin: 2 Mensen (korrigiert - HU Süd entfernt)
// Berliner Hochschule für Technik: 3 Mensen
// Alice Salomon Hochschule Berlin: 1 Mensen
// Universität der Künste Berlin: 5 Mensen (teilt Mensen mit TU Berlin)
// Weißensee Kunsthochschule Berlin: 1 Mensen
// Evangelische Hochschule Berlin: 2 Mensen
// Katholische Hochschule für Sozialwesen Berlin: 1 Mensen
// Hochschule für Schauspielkunst Ernst Busch: 1 Mensen
// Hochschule für Soziale Arbeit und Pädagogik: 1 Mensen (neu hinzugefügt)
