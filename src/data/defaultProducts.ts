import type { CategoryId } from '../types'

export interface DefaultProduct {
  name: string
  category: CategoryId
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  // Warzywa i owoce
  { name: 'Marchewka',        category: 'vegetables' },
  { name: 'Ziemniaki',        category: 'vegetables' },
  { name: 'Cebula',           category: 'vegetables' },
  { name: 'Cebula czerwona',  category: 'vegetables' },
  { name: 'Czosnek',          category: 'vegetables' },
  { name: 'Pomidory',         category: 'vegetables' },
  { name: 'Ogórek',           category: 'vegetables' },
  { name: 'Ogórek kiszony',   category: 'vegetables' },
  { name: 'Papryka',          category: 'vegetables' },
  { name: 'Papryka czerwona', category: 'vegetables' },
  { name: 'Sałata',           category: 'vegetables' },
  { name: 'Szpinak',          category: 'vegetables' },
  { name: 'Brokuł',           category: 'vegetables' },
  { name: 'Kalafior',         category: 'vegetables' },
  { name: 'Por',              category: 'vegetables' },
  { name: 'Pietruszka',       category: 'vegetables' },
  { name: 'Seler',            category: 'vegetables' },
  { name: 'Pieczarki',        category: 'vegetables' },
  { name: 'Szczypiorek',      category: 'vegetables' },
  { name: 'Jabłka',           category: 'vegetables' },
  { name: 'Banany',           category: 'vegetables' },
  { name: 'Pomarańcze',       category: 'vegetables' },
  { name: 'Cytryna',          category: 'vegetables' },
  { name: 'Gruszki',          category: 'vegetables' },
  { name: 'Truskawki',        category: 'vegetables' },
  { name: 'Winogrona',        category: 'vegetables' },
  { name: 'Kapusta kiszona',  category: 'vegetables' },
  { name: 'Kapusta biała',    category: 'vegetables' },
  { name: 'Awokado',          category: 'vegetables' },
  { name: 'Limonka',          category: 'vegetables' },

  // Konserwy
  { name: 'Tuńczyk w puszce',       category: 'konserwy' },
  { name: 'Fasola w puszce',         category: 'konserwy' },
  { name: 'Kukurydza w puszce',      category: 'konserwy' },
  { name: 'Groszek w puszce',        category: 'konserwy' },
  { name: 'Pomidory w puszce',       category: 'konserwy' },
  { name: 'Oliwki',                  category: 'konserwy' },
  { name: 'Sardynki',                category: 'konserwy' },
  { name: 'Makrelka w oleju',        category: 'konserwy' },
  { name: 'Szparagi w puszce',       category: 'konserwy' },
  { name: 'Kapary',                  category: 'konserwy' },

  // Przyprawy
  { name: 'Papryka słodka',          category: 'spices' },
  { name: 'Kurkuma',                 category: 'spices' },
  { name: 'Oregano',                 category: 'spices' },
  { name: 'Bazylia',                 category: 'spices' },
  { name: 'Tymianek',                category: 'spices' },
  { name: 'Cynamon',                 category: 'spices' },
  { name: 'Curry',                   category: 'spices' },
  { name: 'Czosnek granulowany',     category: 'spices' },
  { name: 'Liść laurowy',            category: 'spices' },
  { name: 'Ziele angielskie',        category: 'spices' },
  { name: 'Pieprz cayenne',          category: 'spices' },

  // Herbata i Kawa
  { name: 'Herbata czarna',          category: 'tea-coffee' },
  { name: 'Herbata zielona',         category: 'tea-coffee' },
  { name: 'Herbata ziołowa',         category: 'tea-coffee' },
  { name: 'Herbata owocowa',         category: 'tea-coffee' },
  { name: 'Kawa mielona',            category: 'tea-coffee' },
  { name: 'Kawa ziarnista',          category: 'tea-coffee' },
  { name: 'Kawa instant',            category: 'tea-coffee' },

  // Przekąski
  { name: 'Chipsy',                  category: 'chips' },
  { name: 'Paluszki',                category: 'chips' },
  { name: 'Popcorn',                 category: 'chips' },
  { name: 'Precelki',                category: 'chips' },
  { name: 'Chrupki',                 category: 'chips' },
  { name: 'Nachos',                  category: 'chips' },
  { name: 'Orzechy',                 category: 'chips' },
  { name: 'Migdały',                 category: 'chips' },

  // Słodycze
  { name: 'Czekolada',               category: 'sweets' },
  { name: 'Ciastka',                 category: 'sweets' },
  { name: 'Baton',                   category: 'sweets' },
  { name: 'Wafelki',                 category: 'sweets' },
  { name: 'Żelki',                   category: 'sweets' },
  { name: 'Miód',                    category: 'sweets' },
  { name: 'Dżem',                    category: 'sweets' },
  { name: 'Nutella',                 category: 'sweets' },

  // Sosy
  { name: 'Ketchup',                 category: 'sauces' },
  { name: 'Musztarda',               category: 'sauces' },
  { name: 'Majonez',                 category: 'sauces' },
  { name: 'Sos sojowy',              category: 'sauces' },
  { name: 'Oliwa z oliwek',          category: 'sauces' },
  { name: 'Olej rzepakowy',          category: 'sauces' },
  { name: 'Ocet',                    category: 'sauces' },
  { name: 'Passata pomidorowa',      category: 'sauces' },
  { name: 'Koncentrat pomidorowy',   category: 'sauces' },
  { name: 'Tabasco',                 category: 'sauces' },

  // Makaron i Ryż
  { name: 'Makaron spaghetti',       category: 'pasta-rice' },
  { name: 'Makaron nitki',           category: 'pasta-rice' },
  { name: 'Makaron penne',           category: 'pasta-rice' },
  { name: 'Makaron',                 category: 'pasta-rice' },
  { name: 'Ryż biały',               category: 'pasta-rice' },
  { name: 'Ryż brązowy',             category: 'pasta-rice' },
  { name: 'Ryż',                     category: 'pasta-rice' },
  { name: 'Kasza',                   category: 'pasta-rice' },
  { name: 'Kasza gryczana',          category: 'pasta-rice' },
  { name: 'Płatki owsiane',          category: 'pasta-rice' },
  { name: 'Mąka',                    category: 'pasta-rice' },
  { name: 'Bułka tarta',             category: 'pasta-rice' },
  { name: 'Musli',                   category: 'pasta-rice' },

  // Sól i Cukier
  { name: 'Sól',                     category: 'salt-sugar' },
  { name: 'Sól morska',              category: 'salt-sugar' },
  { name: 'Cukier',                  category: 'salt-sugar' },
  { name: 'Cukier puder',            category: 'salt-sugar' },
  { name: 'Cukier trzcinowy',        category: 'salt-sugar' },
  { name: 'Ksylitol',                category: 'salt-sugar' },

  // Nabiał
  { name: 'Mleko',                   category: 'dairy' },
  { name: 'Mleko 2%',                category: 'dairy' },
  { name: 'Jogurt naturalny',        category: 'dairy' },
  { name: 'Jogurt grecki',           category: 'dairy' },
  { name: 'Kefir',                   category: 'dairy' },
  { name: 'Maślanka',                category: 'dairy' },
  { name: 'Śmietana',                category: 'dairy' },
  { name: 'Śmietana 18%',            category: 'dairy' },
  { name: 'Masło',                   category: 'dairy' },
  { name: 'Jajka',                   category: 'dairy' },
  { name: 'Mleko roślinne',          category: 'dairy' },
  { name: 'Twaróg',                  category: 'dairy' },
  { name: 'Twaróg półtłusty',        category: 'dairy' },

  // Wędlina i Ser
  { name: 'Szynka',                  category: 'deli' },
  { name: 'Kiełbasa',                category: 'deli' },
  { name: 'Kiełbasa biała',          category: 'deli' },
  { name: 'Salami',                  category: 'deli' },
  { name: 'Mortadela',               category: 'deli' },
  { name: 'Boczek',                  category: 'deli' },
  { name: 'Ser żółty',               category: 'deli' },
  { name: 'Feta',                    category: 'deli' },
  { name: 'Mozzarella',              category: 'deli' },
  { name: 'Parmezan',                category: 'deli' },
  { name: 'Brie',                    category: 'deli' },

  // Mięso
  { name: 'Pierś z kurczaka',        category: 'meat' },
  { name: 'Kurczak',                 category: 'meat' },
  { name: 'Mięso mielone',           category: 'meat' },
  { name: 'Schab',                   category: 'meat' },
  { name: 'Karkówka',                category: 'meat' },
  { name: 'Łosoś',                   category: 'meat' },

  // Mrożonki
  { name: 'Mrożone warzywa',         category: 'frozen' },
  { name: 'Mrożony szpinak',         category: 'frozen' },
  { name: 'Lody',                    category: 'frozen' },
  { name: 'Frytki mrożone',          category: 'frozen' },
  { name: 'Pizza mrożona',           category: 'frozen' },

  // Pieczywo
  { name: 'Chleb',                   category: 'bread' },
  { name: 'Chleb tostowy',           category: 'bread' },
  { name: 'Chleb żytni',             category: 'bread' },
  { name: 'Bułki',                   category: 'bread' },
  { name: 'Bagietka',                category: 'bread' },

  // Alkohole
  { name: 'Piwo',                    category: 'alcohol' },
  { name: 'Wino czerwone',           category: 'alcohol' },
  { name: 'Wino białe',              category: 'alcohol' },
  { name: 'Wódka',                   category: 'alcohol' },
  { name: 'Szampan',                 category: 'alcohol' },

  // Napoje
  { name: 'Sok pomarańczowy',        category: 'drinks' },
  { name: 'Sok jabłkowy',            category: 'drinks' },
  { name: 'Cola',                    category: 'drinks' },
  { name: 'Sprite',                  category: 'drinks' },
  { name: 'Energetyk',               category: 'drinks' },

  // Woda
  { name: 'Woda mineralna',          category: 'water' },
  { name: 'Woda gazowana',           category: 'water' },
  { name: 'Woda niegazowana',        category: 'water' },

  // Artykuły higieniczne
  { name: 'Szampon',                 category: 'hygiene' },
  { name: 'Żel pod prysznic',        category: 'hygiene' },
  { name: 'Pasta do zębów',          category: 'hygiene' },
  { name: 'Dezodorant',              category: 'hygiene' },
  { name: 'Mydło',                   category: 'hygiene' },
  { name: 'Krem do twarzy',          category: 'hygiene' },

  // Artykuły Chemiczne
  { name: 'Papier toaletowy',        category: 'household' },
  { name: 'Płyn do naczyń',          category: 'household' },
  { name: 'Proszek do prania',       category: 'household' },
  { name: 'Worki na śmieci',         category: 'household' },
  { name: 'Ściereczki kuchenne',     category: 'household' },
  { name: 'Folia aluminiowa',        category: 'household' },
  { name: 'Papier do pieczenia',     category: 'household' },
  { name: 'Płyn do WC',             category: 'household' },
  { name: 'Płyn do podłóg',         category: 'household' },
]
