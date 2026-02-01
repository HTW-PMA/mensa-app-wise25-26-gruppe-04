// constants/locations.ts

export type Location = {
    id: string;
    name: string;
    short: string;
};

export const LOCATION_STORAGE_KEY = 'selected_mensa_location';

export const LOCATIONS: Location[] = [
    { id: 'htw', short: 'HTW', name: 'HTW Berlin Mensa' },
    { id: 'hwr', short: 'HWR', name: 'HWR Berlin Mensa' },
    { id: 'hu', short: 'HU', name: 'Humboldt-Universität Mensa' },
    { id: 'fu', short: 'FU', name: 'Freie Universität Mensa' },
    { id: 'tu', short: 'TU', name: 'Technische Universität Mensa' },

    { id: 'charite', short: 'Charité', name: 'Charité – Universitätsmedizin Mensa' },

    { id: 'bht', short: 'BHT', name: 'Berliner Hochschule für Technik Mensa' },
    { id: 'ash', short: 'ASH', name: 'Alice Salomon Hochschule Mensa' },

    { id: 'udk', short: 'UdK', name: 'Universität der Künste Mensa' },
    { id: 'khb', short: 'KHB', name: 'Kunsthochschule Weißensee Mensa' },
    { id: 'hfm', short: 'HfM', name: 'Hochschule für Musik Hanns Eisler Mensa' },
    { id: 'hfs', short: 'HfS', name: 'Hochschule für Schauspielkunst Ernst Busch Mensa' },

    { id: 'ehb', short: 'EHB', name: 'Evangelische Hochschule Mensa' },
    { id: 'khsb', short: 'KHSB', name: 'Katholische Hochschule für Sozialwesen Mensa' },
];