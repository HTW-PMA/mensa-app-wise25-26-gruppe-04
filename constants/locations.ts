// constants/locations.ts

export type Location = {
    id: string;
    name: string;
    short: string;
    address?: string;
    canteenSearch?: string;
};

export const LOCATION_STORAGE_KEY = 'selected_mensa_location';

export const LOCATIONS: Location[] = [
    { id: 'htw', short: 'HTW', name: 'HTW Berlin Mensa', address: 'Wilhelminenhofstraße 75A, 12459 Berlin', canteenSearch: 'HTW' },
    { id: 'hwr', short: 'HWR', name: 'HWR Berlin Mensa', address: 'Badensche Straße 52, 10825 Berlin', canteenSearch: 'HWR' },
    { id: 'hu', short: 'HU', name: 'Humboldt-Universität Mensa', address: 'Unter den Linden 6, 10117 Berlin', canteenSearch: 'Humboldt' },
    { id: 'fu', short: 'FU', name: 'Freie Universität Mensa', address: 'Otto-von-Simson-Straße 26, 14195 Berlin', canteenSearch: 'FU Berlin' },
    { id: 'tu', short: 'TU', name: 'Technische Universität Mensa', address: 'Hardenbergstraße 34, 10623 Berlin', canteenSearch: 'TU Berlin' },

    { id: 'charite', short: 'Charité', name: 'Charité – Universitätsmedizin Mensa', address: 'Charitéplatz 1, 10117 Berlin', canteenSearch: 'Charité' },

    { id: 'bht', short: 'BHT', name: 'Berliner Hochschule für Technik Mensa', address: 'Luxemburger Str. 10, 13353 Berlin', canteenSearch: 'BHT' },
    { id: 'ash', short: 'ASH', name: 'Alice Salomon Hochschule Mensa', address: 'Alice-Salomon-Platz 5, 12627 Berlin', canteenSearch: 'Alice Salomon' },

    { id: 'udk', short: 'UdK', name: 'Universität der Künste Mensa', address: 'Hardenbergstraße 33, 10623 Berlin', canteenSearch: 'UdK' },
    { id: 'khb', short: 'KHB', name: 'Kunsthochschule Weißensee Mensa', address: 'Bühringstraße 20, 13086 Berlin', canteenSearch: 'Weißensee' },
    { id: 'hfm', short: 'HfM', name: 'Hochschule für Musik Hanns Eisler Mensa', address: 'Charlottenstraße 55, 10117 Berlin', canteenSearch: 'Hanns Eisler' },
    { id: 'hfs', short: 'HfS', name: 'Hochschule für Schauspielkunst Ernst Busch Mensa', address: 'Zinnowitzer Str. 11, 10115 Berlin', canteenSearch: 'Ernst Busch' },

    { id: 'ehb', short: 'EHB', name: 'Evangelische Hochschule Mensa', address: 'Teltower Damm 118, 14163 Berlin', canteenSearch: 'EHB' },
    { id: 'khsb', short: 'KHSB', name: 'Katholische Hochschule für Sozialwesen Mensa', address: 'Köpenicker Allee 39, 10318 Berlin', canteenSearch: 'KHSB' },
];