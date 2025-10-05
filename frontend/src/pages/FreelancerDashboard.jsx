/**
 * Freelancer Dashboard
 * Main dashboard for freelancers to view their profile, projects, and performance
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Complete list of IANA timezones
const TIMEZONES = [
  { value: 'Pacific/Midway', label: 'Midway (UTC-11:00)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (UTC-10:00)' },
  { value: 'America/Anchorage', label: 'Anchorage (UTC-09:00)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-08:00)' },
  { value: 'America/Tijuana', label: 'Tijuana (UTC-08:00)' },
  { value: 'America/Denver', label: 'Denver (UTC-07:00)' },
  { value: 'America/Phoenix', label: 'Phoenix (UTC-07:00)' },
  { value: 'America/Chihuahua', label: 'Chihuahua (UTC-07:00)' },
  { value: 'America/Mazatlan', label: 'Mazatlan (UTC-07:00)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-06:00)' },
  { value: 'America/Regina', label: 'Regina (UTC-06:00)' },
  { value: 'America/Mexico_City', label: 'Mexico City (UTC-06:00)' },
  { value: 'America/Monterrey', label: 'Monterrey (UTC-06:00)' },
  { value: 'America/Guatemala', label: 'Guatemala (UTC-06:00)' },
  { value: 'America/New_York', label: 'New York (UTC-05:00)' },
  { value: 'America/Indiana/Indianapolis', label: 'Indianapolis (UTC-05:00)' },
  { value: 'America/Bogota', label: 'Bogota (UTC-05:00)' },
  { value: 'America/Lima', label: 'Lima (UTC-05:00)' },
  { value: 'America/Halifax', label: 'Halifax (UTC-04:00)' },
  { value: 'America/Caracas', label: 'Caracas (UTC-04:00)' },
  { value: 'America/La_Paz', label: 'La Paz (UTC-04:00)' },
  { value: 'America/Santiago', label: 'Santiago (UTC-04:00)' },
  { value: 'America/St_Johns', label: 'St Johns (UTC-03:30)' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo (UTC-03:00)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-03:00)' },
  { value: 'America/Godthab', label: 'Godthab (UTC-03:00)' },
  { value: 'America/Montevideo', label: 'Montevideo (UTC-03:00)' },
  { value: 'Atlantic/South_Georgia', label: 'South Georgia (UTC-02:00)' },
  { value: 'Atlantic/Azores', label: 'Azores (UTC-01:00)' },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde (UTC-01:00)' },
  { value: 'Europe/London', label: 'London (UTC+00:00)' },
  { value: 'Europe/Dublin', label: 'Dublin (UTC+00:00)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (UTC+00:00)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (UTC+00:00)' },
  { value: 'Africa/Monrovia', label: 'Monrovia (UTC+00:00)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+01:00)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+01:00)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+01:00)' },
  { value: 'Europe/Rome', label: 'Rome (UTC+01:00)' },
  { value: 'Europe/Brussels', label: 'Brussels (UTC+01:00)' },
  { value: 'Europe/Vienna', label: 'Vienna (UTC+01:00)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+01:00)' },
  { value: 'Africa/Algiers', label: 'Algiers (UTC+01:00)' },
  { value: 'Africa/Lagos', label: 'Lagos (UTC+01:00)' },
  { value: 'Europe/Athens', label: 'Athens (UTC+02:00)' },
  { value: 'Europe/Bucharest', label: 'Bucharest (UTC+02:00)' },
  { value: 'Africa/Cairo', label: 'Cairo (UTC+02:00)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (UTC+02:00)' },
  { value: 'Europe/Kiev', label: 'Kiev (UTC+02:00)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+02:00)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (UTC+02:00)' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+03:00)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (UTC+03:00)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (UTC+03:00)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (UTC+03:00)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (UTC+03:00)' },
  { value: 'Asia/Tehran', label: 'Tehran (UTC+03:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+04:00)' },
  { value: 'Asia/Baku', label: 'Baku (UTC+04:00)' },
  { value: 'Asia/Yerevan', label: 'Yerevan (UTC+04:00)' },
  { value: 'Asia/Kabul', label: 'Kabul (UTC+04:30)' },
  { value: 'Asia/Karachi', label: 'Karachi (UTC+05:00)' },
  { value: 'Asia/Tashkent', label: 'Tashkent (UTC+05:00)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (UTC+05:30)' },
  { value: 'Asia/Colombo', label: 'Colombo (UTC+05:30)' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (UTC+05:45)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (UTC+06:00)' },
  { value: 'Asia/Almaty', label: 'Almaty (UTC+06:00)' },
  { value: 'Asia/Yangon', label: 'Yangon (UTC+06:30)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+07:00)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (UTC+07:00)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+08:00)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+08:00)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+08:00)' },
  { value: 'Asia/Taipei', label: 'Taipei (UTC+08:00)' },
  { value: 'Australia/Perth', label: 'Perth (UTC+08:00)' },
  { value: 'Asia/Seoul', label: 'Seoul (UTC+09:00)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+09:00)' },
  { value: 'Australia/Darwin', label: 'Darwin (UTC+09:30)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (UTC+09:30)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10:00)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (UTC+10:00)' },
  { value: 'Australia/Hobart', label: 'Hobart (UTC+10:00)' },
  { value: 'Pacific/Guam', label: 'Guam (UTC+10:00)' },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby (UTC+10:00)' },
  { value: 'Asia/Vladivostok', label: 'Vladivostok (UTC+10:00)' },
  { value: 'Pacific/Guadalcanal', label: 'Guadalcanal (UTC+11:00)' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12:00)' },
  { value: 'Pacific/Fiji', label: 'Fiji (UTC+12:00)' },
  { value: 'Pacific/Tongatapu', label: 'Tongatapu (UTC+13:00)' },
  { value: 'Pacific/Apia', label: 'Apia (UTC+13:00)' },
  { value: 'Africa/Abidjan', label: 'Abidjan (UTC+00:00)' },
  { value: 'Africa/Accra', label: 'Accra (UTC+00:00)' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (UTC+03:00)' },
  { value: 'Africa/Asmara', label: 'Asmara (UTC+03:00)' },
  { value: 'Africa/Bamako', label: 'Bamako (UTC+00:00)' },
  { value: 'Africa/Bangui', label: 'Bangui (UTC+01:00)' },
  { value: 'Africa/Banjul', label: 'Banjul (UTC+00:00)' },
  { value: 'Africa/Bissau', label: 'Bissau (UTC+00:00)' },
  { value: 'Africa/Blantyre', label: 'Blantyre (UTC+02:00)' },
  { value: 'Africa/Brazzaville', label: 'Brazzaville (UTC+01:00)' },
  { value: 'Africa/Bujumbura', label: 'Bujumbura (UTC+02:00)' },
  { value: 'Africa/Conakry', label: 'Conakry (UTC+00:00)' },
  { value: 'Africa/Dakar', label: 'Dakar (UTC+00:00)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (UTC+03:00)' },
  { value: 'Africa/Djibouti', label: 'Djibouti (UTC+03:00)' },
  { value: 'Africa/Douala', label: 'Douala (UTC+01:00)' },
  { value: 'Africa/El_Aaiun', label: 'El Aaiun (UTC+00:00)' },
  { value: 'Africa/Freetown', label: 'Freetown (UTC+00:00)' },
  { value: 'Africa/Gaborone', label: 'Gaborone (UTC+02:00)' },
  { value: 'Africa/Harare', label: 'Harare (UTC+02:00)' },
  { value: 'Africa/Kampala', label: 'Kampala (UTC+03:00)' },
  { value: 'Africa/Khartoum', label: 'Khartoum (UTC+02:00)' },
  { value: 'Africa/Kigali', label: 'Kigali (UTC+02:00)' },
  { value: 'Africa/Kinshasa', label: 'Kinshasa (UTC+01:00)' },
  { value: 'Africa/Libreville', label: 'Libreville (UTC+01:00)' },
  { value: 'Africa/Lome', label: 'Lome (UTC+00:00)' },
  { value: 'Africa/Luanda', label: 'Luanda (UTC+01:00)' },
  { value: 'Africa/Lubumbashi', label: 'Lubumbashi (UTC+02:00)' },
  { value: 'Africa/Lusaka', label: 'Lusaka (UTC+02:00)' },
  { value: 'Africa/Malabo', label: 'Malabo (UTC+01:00)' },
  { value: 'Africa/Maputo', label: 'Maputo (UTC+02:00)' },
  { value: 'Africa/Maseru', label: 'Maseru (UTC+02:00)' },
  { value: 'Africa/Mbabane', label: 'Mbabane (UTC+02:00)' },
  { value: 'Africa/Mogadishu', label: 'Mogadishu (UTC+03:00)' },
  { value: 'Africa/Niamey', label: 'Niamey (UTC+01:00)' },
  { value: 'Africa/Nouakchott', label: 'Nouakchott (UTC+00:00)' },
  { value: 'Africa/Ouagadougou', label: 'Ouagadougou (UTC+00:00)' },
  { value: 'Africa/Porto-Novo', label: 'Porto-Novo (UTC+01:00)' },
  { value: 'Africa/Sao_Tome', label: 'Sao Tome (UTC+00:00)' },
  { value: 'Africa/Tripoli', label: 'Tripoli (UTC+02:00)' },
  { value: 'Africa/Tunis', label: 'Tunis (UTC+01:00)' },
  { value: 'Africa/Windhoek', label: 'Windhoek (UTC+02:00)' },
  { value: 'America/Adak', label: 'Adak (UTC-10:00)' },
  { value: 'America/Araguaina', label: 'Araguaina (UTC-03:00)' },
  { value: 'America/Asuncion', label: 'Asuncion (UTC-04:00)' },
  { value: 'America/Bahia', label: 'Bahia (UTC-03:00)' },
  { value: 'America/Barbados', label: 'Barbados (UTC-04:00)' },
  { value: 'America/Belize', label: 'Belize (UTC-06:00)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (UTC-04:00)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (UTC-04:00)' },
  { value: 'America/Cancun', label: 'Cancun (UTC-05:00)' },
  { value: 'America/Cayenne', label: 'Cayenne (UTC-03:00)' },
  { value: 'America/Costa_Rica', label: 'Costa Rica (UTC-06:00)' },
  { value: 'America/Cuiaba', label: 'Cuiaba (UTC-04:00)' },
  { value: 'America/Curacao', label: 'Curacao (UTC-04:00)' },
  { value: 'America/Dawson_Creek', label: 'Dawson Creek (UTC-07:00)' },
  { value: 'America/Edmonton', label: 'Edmonton (UTC-07:00)' },
  { value: 'America/El_Salvador', label: 'El Salvador (UTC-06:00)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-03:00)' },
  { value: 'America/Grand_Turk', label: 'Grand Turk (UTC-05:00)' },
  { value: 'America/Guayaquil', label: 'Guayaquil (UTC-05:00)' },
  { value: 'America/Guyana', label: 'Guyana (UTC-04:00)' },
  { value: 'America/Havana', label: 'Havana (UTC-05:00)' },
  { value: 'America/Hermosillo', label: 'Hermosillo (UTC-07:00)' },
  { value: 'America/Jamaica', label: 'Jamaica (UTC-05:00)' },
  { value: 'America/Managua', label: 'Managua (UTC-06:00)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-04:00)' },
  { value: 'America/Martinique', label: 'Martinique (UTC-04:00)' },
  { value: 'America/Matamoros', label: 'Matamoros (UTC-06:00)' },
  { value: 'America/Merida', label: 'Merida (UTC-06:00)' },
  { value: 'America/Miquelon', label: 'Miquelon (UTC-03:00)' },
  { value: 'America/Noronha', label: 'Noronha (UTC-02:00)' },
  { value: 'America/Panama', label: 'Panama (UTC-05:00)' },
  { value: 'America/Paramaribo', label: 'Paramaribo (UTC-03:00)' },
  { value: 'America/Port-au-Prince', label: 'Port-au-Prince (UTC-05:00)' },
  { value: 'America/Port_of_Spain', label: 'Port of Spain (UTC-04:00)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (UTC-04:00)' },
  { value: 'America/Puerto_Rico', label: 'Puerto Rico (UTC-04:00)' },
  { value: 'America/Recife', label: 'Recife (UTC-03:00)' },
  { value: 'America/Santarem', label: 'Santarem (UTC-03:00)' },
  { value: 'America/Santo_Domingo', label: 'Santo Domingo (UTC-04:00)' },
  { value: 'America/Tegucigalpa', label: 'Tegucigalpa (UTC-06:00)' },
  { value: 'America/Thule', label: 'Thule (UTC-04:00)' },
  { value: 'America/Toronto', label: 'Toronto (UTC-05:00)' },
  { value: 'America/Vancouver', label: 'Vancouver (UTC-08:00)' },
  { value: 'America/Whitehorse', label: 'Whitehorse (UTC-07:00)' },
  { value: 'America/Winnipeg', label: 'Winnipeg (UTC-06:00)' },
  { value: 'Asia/Aden', label: 'Aden (UTC+03:00)' },
  { value: 'Asia/Amman', label: 'Amman (UTC+02:00)' },
  { value: 'Asia/Anadyr', label: 'Anadyr (UTC+12:00)' },
  { value: 'Asia/Aqtau', label: 'Aqtau (UTC+05:00)' },
  { value: 'Asia/Aqtobe', label: 'Aqtobe (UTC+05:00)' },
  { value: 'Asia/Ashgabat', label: 'Ashgabat (UTC+05:00)' },
  { value: 'Asia/Atyrau', label: 'Atyrau (UTC+05:00)' },
  { value: 'Asia/Bahrain', label: 'Bahrain (UTC+03:00)' },
  { value: 'Asia/Beirut', label: 'Beirut (UTC+02:00)' },
  { value: 'Asia/Bishkek', label: 'Bishkek (UTC+06:00)' },
  { value: 'Asia/Brunei', label: 'Brunei (UTC+08:00)' },
  { value: 'Asia/Chita', label: 'Chita (UTC+09:00)' },
  { value: 'Asia/Choibalsan', label: 'Choibalsan (UTC+08:00)' },
  { value: 'Asia/Damascus', label: 'Damascus (UTC+02:00)' },
  { value: 'Asia/Dili', label: 'Dili (UTC+09:00)' },
  { value: 'Asia/Dushanbe', label: 'Dushanbe (UTC+05:00)' },
  { value: 'Asia/Famagusta', label: 'Famagusta (UTC+02:00)' },
  { value: 'Asia/Gaza', label: 'Gaza (UTC+02:00)' },
  { value: 'Asia/Hebron', label: 'Hebron (UTC+02:00)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (UTC+07:00)' },
  { value: 'Asia/Hovd', label: 'Hovd (UTC+07:00)' },
  { value: 'Asia/Irkutsk', label: 'Irkutsk (UTC+08:00)' },
  { value: 'Asia/Jayapura', label: 'Jayapura (UTC+09:00)' },
  { value: 'Asia/Kamchatka', label: 'Kamchatka (UTC+12:00)' },
  { value: 'Asia/Khandyga', label: 'Khandyga (UTC+09:00)' },
  { value: 'Asia/Krasnoyarsk', label: 'Krasnoyarsk (UTC+07:00)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (UTC+08:00)' },
  { value: 'Asia/Kuching', label: 'Kuching (UTC+08:00)' },
  { value: 'Asia/Macau', label: 'Macau (UTC+08:00)' },
  { value: 'Asia/Magadan', label: 'Magadan (UTC+11:00)' },
  { value: 'Asia/Makassar', label: 'Makassar (UTC+08:00)' },
  { value: 'Asia/Manila', label: 'Manila (UTC+08:00)' },
  { value: 'Asia/Nicosia', label: 'Nicosia (UTC+02:00)' },
  { value: 'Asia/Novokuznetsk', label: 'Novokuznetsk (UTC+07:00)' },
  { value: 'Asia/Novosibirsk', label: 'Novosibirsk (UTC+07:00)' },
  { value: 'Asia/Omsk', label: 'Omsk (UTC+06:00)' },
  { value: 'Asia/Oral', label: 'Oral (UTC+05:00)' },
  { value: 'Asia/Phnom_Penh', label: 'Phnom Penh (UTC+07:00)' },
  { value: 'Asia/Pontianak', label: 'Pontianak (UTC+07:00)' },
  { value: 'Asia/Pyongyang', label: 'Pyongyang (UTC+09:00)' },
  { value: 'Asia/Qatar', label: 'Qatar (UTC+03:00)' },
  { value: 'Asia/Qyzylorda', label: 'Qyzylorda (UTC+05:00)' },
  { value: 'Asia/Sakhalin', label: 'Sakhalin (UTC+11:00)' },
  { value: 'Asia/Samarkand', label: 'Samarkand (UTC+05:00)' },
  { value: 'Asia/Srednekolymsk', label: 'Srednekolymsk (UTC+11:00)' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi (UTC+04:00)' },
  { value: 'Asia/Thimphu', label: 'Thimphu (UTC+06:00)' },
  { value: 'Asia/Ulaanbaatar', label: 'Ulaanbaatar (UTC+08:00)' },
  { value: 'Asia/Urumqi', label: 'Urumqi (UTC+06:00)' },
  { value: 'Asia/Ust-Nera', label: 'Ust-Nera (UTC+10:00)' },
  { value: 'Asia/Vientiane', label: 'Vientiane (UTC+07:00)' },
  { value: 'Asia/Yakutsk', label: 'Yakutsk (UTC+09:00)' },
  { value: 'Asia/Yekaterinburg', label: 'Yekaterinburg (UTC+05:00)' },
  { value: 'Atlantic/Bermuda', label: 'Bermuda (UTC-04:00)' },
  { value: 'Atlantic/Canary', label: 'Canary (UTC+00:00)' },
  { value: 'Atlantic/Faroe', label: 'Faroe (UTC+00:00)' },
  { value: 'Atlantic/Madeira', label: 'Madeira (UTC+00:00)' },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik (UTC+00:00)' },
  { value: 'Atlantic/Stanley', label: 'Stanley (UTC-03:00)' },
  { value: 'Australia/Broken_Hill', label: 'Broken Hill (UTC+09:30)' },
  { value: 'Australia/Currie', label: 'Currie (UTC+10:00)' },
  { value: 'Australia/Eucla', label: 'Eucla (UTC+08:45)' },
  { value: 'Australia/Lindeman', label: 'Lindeman (UTC+10:00)' },
  { value: 'Australia/Lord_Howe', label: 'Lord Howe (UTC+10:30)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (UTC+10:00)' },
  { value: 'Europe/Andorra', label: 'Andorra (UTC+01:00)' },
  { value: 'Europe/Astrakhan', label: 'Astrakhan (UTC+04:00)' },
  { value: 'Europe/Belgrade', label: 'Belgrade (UTC+01:00)' },
  { value: 'Europe/Bratislava', label: 'Bratislava (UTC+01:00)' },
  { value: 'Europe/Budapest', label: 'Budapest (UTC+01:00)' },
  { value: 'Europe/Chisinau', label: 'Chisinau (UTC+02:00)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (UTC+01:00)' },
  { value: 'Europe/Gibraltar', label: 'Gibraltar (UTC+01:00)' },
  { value: 'Europe/Guernsey', label: 'Guernsey (UTC+00:00)' },
  { value: 'Europe/Isle_of_Man', label: 'Isle of Man (UTC+00:00)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+03:00)' },
  { value: 'Europe/Jersey', label: 'Jersey (UTC+00:00)' },
  { value: 'Europe/Kaliningrad', label: 'Kaliningrad (UTC+02:00)' },
  { value: 'Europe/Luxembourg', label: 'Luxembourg (UTC+01:00)' },
  { value: 'Europe/Malta', label: 'Malta (UTC+01:00)' },
  { value: 'Europe/Minsk', label: 'Minsk (UTC+03:00)' },
  { value: 'Europe/Monaco', label: 'Monaco (UTC+01:00)' },
  { value: 'Europe/Oslo', label: 'Oslo (UTC+01:00)' },
  { value: 'Europe/Prague', label: 'Prague (UTC+01:00)' },
  { value: 'Europe/Riga', label: 'Riga (UTC+02:00)' },
  { value: 'Europe/San_Marino', label: 'San Marino (UTC+01:00)' },
  { value: 'Europe/Sarajevo', label: 'Sarajevo (UTC+01:00)' },
  { value: 'Europe/Simferopol', label: 'Simferopol (UTC+03:00)' },
  { value: 'Europe/Skopje', label: 'Skopje (UTC+01:00)' },
  { value: 'Europe/Sofia', label: 'Sofia (UTC+02:00)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (UTC+01:00)' },
  { value: 'Europe/Tallinn', label: 'Tallinn (UTC+02:00)' },
  { value: 'Europe/Tirane', label: 'Tirane (UTC+01:00)' },
  { value: 'Europe/Ulyanovsk', label: 'Ulyanovsk (UTC+04:00)' },
  { value: 'Europe/Vaduz', label: 'Vaduz (UTC+01:00)' },
  { value: 'Europe/Vatican', label: 'Vatican (UTC+01:00)' },
  { value: 'Europe/Vilnius', label: 'Vilnius (UTC+02:00)' },
  { value: 'Europe/Volgograd', label: 'Volgograd (UTC+03:00)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (UTC+01:00)' },
  { value: 'Europe/Zagreb', label: 'Zagreb (UTC+01:00)' },
  { value: 'Europe/Zurich', label: 'Zurich (UTC+01:00)' },
  { value: 'Indian/Antananarivo', label: 'Antananarivo (UTC+03:00)' },
  { value: 'Indian/Chagos', label: 'Chagos (UTC+06:00)' },
  { value: 'Indian/Christmas', label: 'Christmas (UTC+07:00)' },
  { value: 'Indian/Cocos', label: 'Cocos (UTC+06:30)' },
  { value: 'Indian/Comoro', label: 'Comoro (UTC+03:00)' },
  { value: 'Indian/Kerguelen', label: 'Kerguelen (UTC+05:00)' },
  { value: 'Indian/Mahe', label: 'Mahe (UTC+04:00)' },
  { value: 'Indian/Maldives', label: 'Maldives (UTC+05:00)' },
  { value: 'Indian/Mauritius', label: 'Mauritius (UTC+04:00)' },
  { value: 'Indian/Mayotte', label: 'Mayotte (UTC+03:00)' },
  { value: 'Indian/Reunion', label: 'Reunion (UTC+04:00)' },
  { value: 'Pacific/Chatham', label: 'Chatham (UTC+12:45)' },
  { value: 'Pacific/Chuuk', label: 'Chuuk (UTC+10:00)' },
  { value: 'Pacific/Easter', label: 'Easter (UTC-06:00)' },
  { value: 'Pacific/Efate', label: 'Efate (UTC+11:00)' },
  { value: 'Pacific/Enderbury', label: 'Enderbury (UTC+13:00)' },
  { value: 'Pacific/Fakaofo', label: 'Fakaofo (UTC+13:00)' },
  { value: 'Pacific/Galapagos', label: 'Galapagos (UTC-06:00)' },
  { value: 'Pacific/Gambier', label: 'Gambier (UTC-09:00)' },
  { value: 'Pacific/Kiritimati', label: 'Kiritimati (UTC+14:00)' },
  { value: 'Pacific/Kosrae', label: 'Kosrae (UTC+11:00)' },
  { value: 'Pacific/Kwajalein', label: 'Kwajalein (UTC+12:00)' },
  { value: 'Pacific/Majuro', label: 'Majuro (UTC+12:00)' },
  { value: 'Pacific/Marquesas', label: 'Marquesas (UTC-09:30)' },
  { value: 'Pacific/Nauru', label: 'Nauru (UTC+12:00)' },
  { value: 'Pacific/Niue', label: 'Niue (UTC-11:00)' },
  { value: 'Pacific/Norfolk', label: 'Norfolk (UTC+11:00)' },
  { value: 'Pacific/Noumea', label: 'Noumea (UTC+11:00)' },
  { value: 'Pacific/Pago_Pago', label: 'Pago Pago (UTC-11:00)' },
  { value: 'Pacific/Palau', label: 'Palau (UTC+09:00)' },
  { value: 'Pacific/Pitcairn', label: 'Pitcairn (UTC-08:00)' },
  { value: 'Pacific/Pohnpei', label: 'Pohnpei (UTC+11:00)' },
  { value: 'Pacific/Rarotonga', label: 'Rarotonga (UTC-10:00)' },
  { value: 'Pacific/Tahiti', label: 'Tahiti (UTC-10:00)' },
  { value: 'Pacific/Tarawa', label: 'Tarawa (UTC+12:00)' },
  { value: 'Pacific/Wake', label: 'Wake (UTC+12:00)' },
  { value: 'Pacific/Wallis', label: 'Wallis (UTC+12:00)' },
];

const HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Availability state
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityStartDate, setAvailabilityStartDate] = useState('');
  const [availabilityEndDate, setAvailabilityEndDate] = useState('');
  const [availabilityTimezone, setAvailabilityTimezone] = useState('');
  const [availabilityStartHour, setAvailabilityStartHour] = useState('');
  const [availabilityEndHour, setAvailabilityEndHour] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getDashboard();
      const data = response.data.data;
      setDashboard(data);

      // Initialize availability states from dashboard data
      if (data.profile) {
        setIsAvailable(data.profile.isAvailableNow || false);
        setAvailabilityStartDate(data.profile.availabilityStartDate ? data.profile.availabilityStartDate.split('T')[0] : '');
        setAvailabilityEndDate(data.profile.availabilityEndDate ? data.profile.availabilityEndDate.split('T')[0] : '');
        setAvailabilityTimezone(data.profile.availabilityTimezone || '');
        setAvailabilityStartHour(data.profile.availabilityStartHour || '');
        setAvailabilityEndHour(data.profile.availabilityEndHour || '');
      }
    } catch (error) {
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (newValue) => {
    setIsAvailable(newValue);
    try {
      await freelancerPortalAPI.updateProfile({ isAvailableNow: newValue });
      setDashboard(prev => ({
        ...prev,
        profile: { ...prev.profile, isAvailableNow: newValue }
      }));
    } catch (error) {
      setIsAvailable(!newValue);
      alert('Failed to update availability');
    }
  };

  const handleAvailabilityChange = async (field, value) => {
    try {
      await freelancerPortalAPI.updateProfile({ [field]: value });
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!dashboard) {
    return <div style={styles.loading}>Dashboard not available</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Freelancer Portal</h1>
          <p style={styles.subtitle}>Welcome, {dashboard.profile.firstName} {dashboard.profile.lastName}</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/freelancer/projects')} style={styles.navButton}>
            Browse Projects
          </button>
          <button onClick={() => navigate('/freelancer/my-projects')} style={styles.navButton}>
            My Projects
          </button>
          <button onClick={() => navigate('/freelancer/performance')} style={styles.navButton}>
            Performance
          </button>
          <button onClick={() => navigate('/freelancer/payments')} style={styles.navButton}>
            Payments
          </button>
          <button onClick={() => navigate('/freelancer/profile')} style={styles.navButton}>
            Profile
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div>
            <h2 style={styles.profileName}>
              {dashboard.profile.firstName} {dashboard.profile.lastName}
            </h2>
            <p style={styles.profileId}>{dashboard.profile.freelancerId}</p>
            <p style={styles.profileEmail}>{dashboard.profile.email}</p>
          </div>
          <div style={styles.badges}>
            <span style={getStatusBadge(dashboard.profile.status)}>{dashboard.profile.status}</span>
            <span style={getTierBadge(dashboard.profile.currentTier)}>{dashboard.profile.currentTier}</span>
            <span style={getGradeBadge(dashboard.profile.currentGrade)}>Grade {dashboard.profile.currentGrade}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Active Projects</label>
          <p style={styles.statValue}>{dashboard.stats.activeProjects}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Pending Applications</label>
          <p style={styles.statValue}>{dashboard.stats.pendingApplications || 0}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Total Projects</label>
          <p style={styles.statValue}>{dashboard.stats.totalProjects}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Average Performance</label>
          <p style={styles.statValue}>{dashboard.stats.avgPerformance}</p>
        </div>
      </div>

      {/* Availability Widget */}
      <div style={styles.availabilityCard}>
        <h2 style={styles.sectionTitle}>My Availability</h2>
        <div style={styles.availabilityToggle}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => handleToggleAvailability(e.target.checked)}
              style={styles.checkbox}
            />
            I am available now
          </label>
        </div>

        {isAvailable && (
          <div style={styles.availabilityDetails}>
            <div style={styles.availabilityRow}>
              <div style={styles.availabilityField}>
                <label style={styles.fieldLabel}>Start Date</label>
                <input
                  type="date"
                  value={availabilityStartDate}
                  onChange={(e) => {
                    setAvailabilityStartDate(e.target.value);
                    handleAvailabilityChange('availabilityStartDate', e.target.value);
                  }}
                  style={styles.input}
                />
              </div>
              <div style={styles.availabilityField}>
                <label style={styles.fieldLabel}>End Date</label>
                <input
                  type="date"
                  value={availabilityEndDate}
                  onChange={(e) => {
                    setAvailabilityEndDate(e.target.value);
                    handleAvailabilityChange('availabilityEndDate', e.target.value);
                  }}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.availabilityRow}>
              <div style={styles.availabilityField}>
                <label style={styles.fieldLabel}>Timezone</label>
                <select
                  value={availabilityTimezone}
                  onChange={(e) => {
                    setAvailabilityTimezone(e.target.value);
                    handleAvailabilityChange('availabilityTimezone', e.target.value);
                  }}
                  style={styles.select}
                >
                  <option value="">Select Timezone</option>
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.availabilityRow}>
              <div style={styles.availabilityField}>
                <label style={styles.fieldLabel}>Start Hour</label>
                <select
                  value={availabilityStartHour}
                  onChange={(e) => {
                    setAvailabilityStartHour(e.target.value);
                    handleAvailabilityChange('availabilityStartHour', e.target.value);
                  }}
                  style={styles.select}
                >
                  <option value="">Select Hour</option>
                  {HOURS.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              <div style={styles.availabilityField}>
                <label style={styles.fieldLabel}>End Hour</label>
                <select
                  value={availabilityEndHour}
                  onChange={(e) => {
                    setAvailabilityEndHour(e.target.value);
                    handleAvailabilityChange('availabilityEndHour', e.target.value);
                  }}
                  style={styles.select}
                >
                  <option value="">Select Hour</option>
                  {HOURS.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Applications */}
      {dashboard.pendingApplications && dashboard.pendingApplications.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Pending Applications ({dashboard.pendingApplications.length})</h2>
          <p style={styles.sectionNote}>Waiting for PM approval</p>
          <div style={styles.projectsGrid}>
            {dashboard.pendingApplications.map((application) => (
              <div key={application.id} style={styles.pendingCard}>
                <h3 style={styles.projectName}>{application.name}</h3>
                <div style={styles.projectDetails}>
                  <InfoItem label="Status" value="Pending Approval" />
                  <InfoItem label="Applied On" value={new Date(application.appliedAt).toLocaleDateString()} />
                </div>
                <p style={styles.pendingNote}>⏳ Your application is under review</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Applications */}
      {dashboard.rejectedApplications && dashboard.rejectedApplications.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Rejected Applications ({dashboard.rejectedApplications.length})</h2>
          <div style={styles.projectsGrid}>
            {dashboard.rejectedApplications.map((application) => (
              <div key={application.id} style={styles.rejectedCard}>
                <h3 style={styles.projectName}>{application.name}</h3>
                <div style={styles.projectDetails}>
                  <InfoItem label="Status" value="Rejected" />
                  <InfoItem label="Applied On" value={new Date(application.appliedAt).toLocaleDateString()} />
                </div>
                {application.rejectionReason && (
                  <p style={styles.rejectionReason}>
                    <strong>Reason:</strong> {application.rejectionReason}
                  </p>
                )}
                <p style={styles.rejectedNote}>❌ Your application was not approved for this project</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Projects ({dashboard.activeProjects.length})</h2>
        {dashboard.activeProjects.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active projects</p>
            <button onClick={() => navigate('/freelancer/projects')} style={styles.browseButton}>
              Browse Available Projects
            </button>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {dashboard.activeProjects.map((project) => (
              <div key={project.id} style={styles.activeCard}>
                <h3 style={styles.projectName}>{project.name}</h3>
                <div style={styles.projectDetails}>
                  <InfoItem label="Role" value={project.role} />
                  <InfoItem label="Status" value={project.status} />
                  <InfoItem label="Start Date" value={new Date(project.startDate).toLocaleDateString()} />
                  {project.endDate && (
                    <InfoItem label="End Date" value={new Date(project.endDate).toLocaleDateString()} />
                  )}
                </div>
                <p style={styles.assignedDate}>
                  Assigned: {new Date(project.assignedAt).toLocaleDateString()}
                </p>
                <p style={styles.activeNote}>✅ You are working on this project</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Performance */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Performance Records</h2>
        {dashboard.recentPerformance.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No performance records yet</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>COM Score</th>
                <th style={styles.th}>QUAL Score</th>
                <th style={styles.th}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentPerformance.map((record) => (
                <tr key={record.id} style={styles.tableRow}>
                  <td style={styles.td}>{new Date(record.recordDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{record.projectId || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.comTotal)}>{record.comTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.qualTotal)}>{record.qualTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.overallScore)}>
                      {record.overallScore?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={() => navigate('/freelancer/performance')} style={styles.viewAllButton}>
          View All Performance Records
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <label style={styles.infoLabel}>{label}</label>
      <p style={styles.infoValue}>{value || 'N/A'}</p>
    </div>
  );
}

function getStatusBadge(status) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (status) {
    case 'ACTIVE':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'ENGAGED':
      return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'INACTIVE':
      return { ...base, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'DEACTIVATED':
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return base;
  }
}

function getTierBadge(tier) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (tier) {
    case 'PLATINUM':
      return { ...base, backgroundColor: '#e0e7ff', color: '#3730a3' };
    case 'GOLD':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'SILVER':
      return { ...base, backgroundColor: '#f3f4f6', color: '#1f2937' };
    case 'BRONZE':
      return { ...base, backgroundColor: '#fed7aa', color: '#7c2d12' };
    default:
      return base;
  }
}

function getGradeBadge(grade) {
  return {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  };
}

function getScoreBadge(score) {
  const base = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
  };

  if (score === null || score === undefined) {
    return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }

  if (score >= 4) {
    return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
  } else if (score >= 3) {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  } else {
    return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {},
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  profileId: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0',
  },
  profileEmail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  availabilityCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  availabilityToggle: {
    marginBottom: '20px',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    cursor: 'pointer',
  },
  availabilityDetails: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  availabilityRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  availabilityField: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  section: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
  browseButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
  },
  projectName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  projectDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '8px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    margin: '2px 0 0 0',
  },
  assignedDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  },
  activeCard: {
    padding: '16px',
    border: '1px solid #10b981',
    borderRadius: '8px',
    backgroundColor: '#d1fae5',
  },
  activeNote: {
    fontSize: '13px',
    color: '#065f46',
    fontStyle: 'italic',
    marginTop: '12px',
    marginBottom: 0,
  },
  pendingCard: {
    padding: '16px',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
  },
  pendingNote: {
    fontSize: '13px',
    color: '#92400e',
    fontStyle: 'italic',
    marginTop: '12px',
    marginBottom: 0,
  },
  rejectedCard: {
    padding: '16px',
    border: '1px solid #f87171',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
  },
  rejectedNote: {
    fontSize: '13px',
    color: '#991b1b',
    fontStyle: 'italic',
    marginTop: '12px',
    marginBottom: 0,
  },
  rejectionReason: {
    fontSize: '13px',
    color: '#991b1b',
    backgroundColor: '#fef2f2',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '8px',
  },
  sectionNote: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '-8px',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#111827',
  },
  viewAllButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};