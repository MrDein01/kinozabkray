import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const adminEmail = 'brigantina@kino75.ru';
const adminPassword = 'GAUKkinokom2024$';

const socials = [
  { id: 'vk', platform: 'vk', label: 'ВКонтакте', url: 'https://vk.ru/kino_chita', iconUrl: '/social/vk.png' },
  { id: 'telegram', platform: 'telegram', label: 'Telegram', url: 'https://t.me/zabkino', iconUrl: '/social/telegram.png' },
  { id: 'max', platform: 'max', label: 'MAX', url: 'https://max.ru/id7536009537_gos', iconUrl: '/social/max.png' },
];

const homeSettings = [
  { key: 'hero_title', value: 'Забайкальская государственная кинокомпания' },
  { key: 'hero_subtitle', value: 'Региональное кино, кинопоказы и культурные проекты Забайкалья' },
  { key: 'footer_address', value: '672039, г. Чита, ул. Н. Островского, 56' },
  { key: 'footer_phone', value: '+7 (3022) 26-66-71' },
  { key: 'footer_email', value: 'kinochita@mail.ru' },
  { key: 'footer_description', value: 'Искусство кино в сердце Забайкалья' },
  { key: 'footer_socials', value: JSON.stringify(socials) },
];

const sourceImage = (path: string) => `https://xn---75-2ddjth.xn--p1ai${path}`;

const newsData = [
  {
    title: 'В кинозале на Островского покажут фильм «Очень странные дела» (18+)',
    slug: 'v-kinozale-na-ostrovskogo-pokazhut-film-ochen-strannye-dela',
    imageUrl: sourceImage('/wp-content/uploads/2025/12/835868ec-76b4-4daf-9569-010419cec3f0.jpg'),
    publishedAt: new Date('2025-12-24'),
    excerpt: 'Сотрудники Забайкальской государственной кинокомпании приглашают всех желающих на просмотр фильма «Очень странные дела» (5,6 серия) (18+). Показ состоится в кинозале на Островского 26 декабря.',
    content: `<p>Сотрудники Забайкальской государственной кинокомпании приглашают всех желающих на просмотр захватывающего фильма «Очень странные дела» (5,6 серия) (18+).</p><p>Показ состоится в кинозале на Островского 26 декабря. По сюжету, события разворачиваются осенью 1987 года. Город Хоукинс покрыт сетью разломов, ведущих в Изнанку. Жизнь в нём парализована, власти вводят карантин и начинают охоту на Одиннадцать.</p>`,
  },
  {
    title: 'Ольга Сахарова вошла в жюри V районного конкурса литературного, журналистского и художественного творчества детей',
    slug: 'olga-saharova-voshla-v-zhyuri-konkursa-proba-pera-2025',
    imageUrl: sourceImage('/wp-content/uploads/2025/12/0ed14ea3-ffd9-490c-9cdc-9ccc2d6f940f.jpg'),
    publishedAt: new Date('2025-12-06'),
    excerpt: 'Директор Забайкальской государственной кинокомпании Ольга Сахарова вошла в жюри V районного конкурса «Проба пера 2025».',
    content: `<p>Директор Забайкальской государственной кинокомпании Ольга Сахарова вошла в жюри V районного конкурса литературного, журналистского и художественного творчества детей «Проба пера 2025».</p><p>Грамоты, подарки, сертификаты и пригласительные билеты в кинотеатр «Бригантина» Ольга Николаевна вручила нескольким ребятам и отметила их работы как лучшие.</p>`,
  },
  {
    title: 'Кинотеатры празднично оформили к Новому году',
    slug: 'kinoteatry-prazdnichno-oformili-k-novomu-godu',
    imageUrl: sourceImage('/wp-content/uploads/2025/12/AuEzi8eISZw.jpg'),
    publishedAt: new Date('2025-12-04'),
    excerpt: 'Все кинотеатры Забайкальской государственной кинокомпании празднично оформлены и украшены к предстоящему Новому году.',
    content: `<p>Все кинотеатры Забайкальской государственной кинокомпании празднично оформлены и украшены к предстоящему Новому году.</p><p>«Это стало доброй традицией — новогоднее оформление наших кинотеатров. Создаём волшебную атмосферу, радуем наших посетителей и готовим большую новогоднюю программу», — отмечает директор Забайкальской государственной кинокомпании Ольга Сахарова.</p>`,
  },
  {
    title: 'Опубликован репертуар кинотеатра «Бригантина»',
    slug: 'opublikovan-repertuar-kinoteatra-brigantina-dekabr-2025',
    imageUrl: sourceImage('/wp-content/uploads/2025/12/68ec2200-2f35-426e-a0a1-135b14eed068.jpg'),
    publishedAt: new Date('2025-12-03'),
    excerpt: 'Предлагаем вниманию репертуар кинотеатра «Бригантина» с 4 по 10 декабря 2025 года.',
    content: `<p>Уважаемые читинцы и гости города, предлагаем вашему вниманию репертуар кинотеатра «Бригантина» с 4 по 10 декабря 2025 г.</p><p>Кассы кинотеатра работают с 10:00 до 22:40. Телефон кассы: 8 (3022) 32-11-32. Автоинформатор: 8 (3022) 217-550.</p><p>Заказ билетов в кинотеатры Забайкальской государственной кинокомпании: https://кино-75.рф/</p>`,
  },
  {
    title: 'Ольга Сахарова вступила в Союз кинематографистов Забайкальского края',
    slug: 'olga-saharova-vstupila-v-soyuz-kinematografistov',
    imageUrl: sourceImage('/wp-content/uploads/2025/09/385c6b8d-b354-46da-b8ed-074358b8c3df.jpg'),
    publishedAt: new Date('2025-11-26'),
    excerpt: 'Директор Забайкальской государственной кинокомпании Ольга Сахарова вступила в Союз кинематографистов Забайкальского края.',
    content: `<p>Директор Забайкальской государственной кинокомпании Ольга Сахарова вступила в Союз кинематографистов Забайкальского края, который создан для координации развития регионального кино.</p><p>Ольга Николаевна поблагодарила председателя Союза кинематографистов Забайкальского края Максима Юсупова за отзывчивость и сотрудничество и отметила, что задачи Союза ей понятны и близки.</p>`,
  },
  {
    title: 'Опубликован репертуар кинотеатра «Бригантина»',
    slug: 'opublikovan-repertuar-kinoteatra-brigantina-oktyabr-2025',
    imageUrl: sourceImage('/wp-content/uploads/2025/10/783e725b-dc47-46ae-be42-abc5e16a41b0.jpg'),
    publishedAt: new Date('2025-10-13'),
    excerpt: 'Предлагаем вниманию репертуар кинотеатра «Бригантина» с 16 по 22 октября 2025 года.',
    content: `<p>Уважаемые читинцы и гости города, предлагаем вашему вниманию репертуар кинотеатра «Бригантина» с 16 по 22 октября 2025 г.</p><p>Кассы кинотеатра работают с 10:00 до 21:20. Номер телефона кассы: 8 (3022) 32-11-32. Автоинформатор: 8 (3022) 217-550.</p><p>Смотрите расписание и покупайте билеты на официальном сайте бригантина.кино-75.рф.</p>`,
  },
  {
    title: 'Директор кинокомпании Ольга Сахарова участвовала во II Дальневосточной кинопремии',
    slug: 'olga-saharova-uchastvovala-vo-vtoroy-dalnevostochnoy-kinopremii',
    imageUrl: sourceImage('/wp-content/uploads/2025/10/ef2ac534-5700-409f-8504-ef4dded92a49.jpg'),
    publishedAt: new Date('2025-10-07'),
    excerpt: 'Ольга Сахарова приняла участие во II Дальневосточной кинопремии, которая прошла с 4 по 6 октября в Республике Бурятия.',
    content: `<p>Директор Забайкальской государственной кинокомпании Ольга Сахарова приняла участие во II Дальневосточной кинопремии, которая прошла с 4 по 6 октября в Республике Бурятия.</p><p>Трёхдневная программа Дальневосточной кинопремии включала пленарные сессии и творческие дискуссии, тренинги, локейшн-туры и мастер-классы от ведущих представителей киноиндустрии.</p>`,
  },
  {
    title: 'Акция «В кино всем классом» пройдёт в наших кинотеатрах',
    slug: 'aktsiya-v-kino-vsem-klassom-proydet-v-nashih-kinoteatrah',
    imageUrl: sourceImage('/wp-content/uploads/2025/09/i.webp'),
    publishedAt: new Date('2025-09-30'),
    excerpt: 'Со 2 октября в кинотеатрах Забайкальской государственной кинокомпании пройдёт акция «В кино всем классом».',
    content: `<p>Со 2 октября в кинотеатрах Забайкальской государственной кинокомпании пройдёт акция «В кино всем классом» — «Нахимовцы. Янтарный берег».</p><p>Фильм «Нахимовцы. Янтарный берег» (12+) является значимым воспитательным и образовательным ресурсом. Его сюжет сочетает личные переживания подростка, спортивные достижения и ситуации реальной опасности.</p>`,
  },
  {
    title: 'Директор кинокомпании Ольга Сахарова и менеджер Ирина Логинова стали гостями студии радио «Маяк»',
    slug: 'olga-saharova-i-irina-loginova-v-studii-radio-mayak',
    imageUrl: sourceImage('/wp-content/uploads/2025/09/4ac9d983-b502-4f60-9e56-16c73ab178c7.jpg'),
    publishedAt: new Date('2025-09-26'),
    excerpt: 'Ольга Сахарова и Ирина Логинова рассказали о деятельности кинокомпании и предстоящем фестивале регионального кино «киноПланка».',
    content: `<p>Ольга Николаевна и Ирина Андреевна рассказали о деятельности кинокомпании и предстоящем фестивале регионального кино «киноПланка», который проводится Забайкальской государственной кинокомпанией при поддержке Министерства культуры края.</p><p>К участию принимаются авторские работы без нарушений, созданные с 2024 года по настоящее время, в форматах MP4, AVI, MOV.</p>`,
  },
  {
    title: '2 октября в 12 ч в Балее состоится благотворительная ярмарка «Доброе лукошко»',
    slug: 'v-balee-sostoitsya-blagotvoritelnaya-yarmarka-dobroe-lukoshko',
    imageUrl: sourceImage('/wp-content/uploads/2025/09/7532549e-6eca-4beb-b9fc-a849e2aa29ab.jpg'),
    publishedAt: new Date('2025-09-24'),
    excerpt: 'В Балее на площадке у кинотеатра «Космос» состоится благотворительная ярмарка в поддержку участников специальной военной операции.',
    content: `<p>В Балее на площадке у кинотеатра «Космос» состоится благотворительная ярмарка, основной целью которой станет поддержка участников специальной военной операции и развитие волонтёрского сообщества.</p><p>«Сейчас важна поддержка всех и каждого. Приходите на ярмарку и внесите свой вклад в победу!», — приглашает директор Забайкальской государственной кинокомпании Ольга Сахарова.</p>`,
  },
];

const cinemasData = [
  {
    name: 'АВАНГАРД',
    address: 'Забайкальский край, п. Кокуй',
    latitude: 52.2039,
    longitude: 117.5545,
    link: 'https://xn--80aaaggh4d0a.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в посёлке Кокуй.',
    order: 1,
  },
  {
    name: 'ДАУРИЯ',
    address: 'Забайкальский край, г. Краснокаменск',
    latitude: 50.0966,
    longitude: 118.0365,
    link: 'https://xn--80ahn5ao8e.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Краснокаменске.',
    order: 2,
  },
  {
    name: 'ЭКРАН',
    address: 'Забайкальский край, пгт Карымское',
    latitude: 51.6167,
    longitude: 114.3500,
    link: 'https://xn--80atkk7d.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Карымском.',
    order: 3,
  },
  {
    name: 'БРИГАНТИНА',
    address: 'Забайкальский край, г. Чита',
    latitude: 52.0317,
    longitude: 113.5009,
    link: 'https://xn--80aabiyc8abvy.xn---75-2ddjth.xn--p1ai/',
    phone: '8 (3022) 32-11-32',
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Чите.',
    order: 4,
  },
  {
    name: 'КОСМОС',
    address: 'Забайкальский край, г. Балей',
    latitude: 51.5820,
    longitude: 116.6370,
    link: 'https://xn--j1aefbnc.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Балее.',
    order: 5,
  },
  {
    name: 'НЕРЧА',
    address: 'Забайкальский край, г. Нерчинск',
    latitude: 51.9833,
    longitude: 116.5833,
    link: 'https://xn--80ajxn9a.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Нерчинске.',
    order: 6,
  },
  {
    name: 'ВОСТОК',
    address: 'Забайкальский край, г. Борзя',
    latitude: 50.3881,
    longitude: 116.5231,
    link: 'https://xn--b1aqlaog.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Борзе.',
    order: 7,
  },
  {
    name: 'РОССИЯ',
    address: 'Забайкальский край, пгт Первомайский',
    latitude: 51.6707,
    longitude: 115.6213,
    link: 'https://xn--h1alffa9f.xn---75-2ddjth.xn--p1ai/',
    phone: null,
    description: 'Кинотеатр Забайкальской государственной кинокомпании в Первомайском.',
    order: 8,
  },
  {
    name: 'Кинозал на Островского',
    address: '672039, г. Чита, ул. Н. Островского, 56',
    latitude: 52.0317,
    longitude: 113.5009,
    link: 'https://xn--b1acuoacbkidh.xn---75-2ddjth.xn--p1ai/',
    phone: '+7 (3022) 26-66-71',
    description: 'Кинозал Забайкальской государственной кинокомпании на улице Н. Островского в Чите.',
    order: 9,
  },
];

const antiCorruptionData = [
  {
    title: 'Памятка. Ответственность за преступления коррупционной направленности',
    description: 'Памятка для работников и граждан об ответственности за коррупционные преступления.',
    fileName: 'anti-corruption-01.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-01.pdf',
    fileSize: 527872,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Новое в уголовном кодексе',
    description: 'Информационный материал о новых положениях уголовного законодательства.',
    fileName: 'anti-corruption-02.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-02.pdf',
    fileSize: 450150,
    category: 'Памятки',
  },
  {
    title: 'Памятка. История противодействия коррупции',
    description: 'Краткая историческая справка о развитии мер противодействия коррупции.',
    fileName: 'anti-corruption-03.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-03.pdf',
    fileSize: 556851,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Что такое противодействие коррупции',
    description: 'Понятие, меры профилактики и основные направления противодействия коррупции.',
    fileName: 'anti-corruption-04.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-04.pdf',
    fileSize: 269414,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Что такое коррупция',
    description: 'Разъяснение понятия коррупции, типичных коррупционных ситуаций и ответственности.',
    fileName: 'anti-corruption-05.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-05.pdf',
    fileSize: 318464,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Если вымогают взятку',
    description: 'Алгоритм действий гражданина при вымогательстве взятки.',
    fileName: 'anti-corruption-06.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-06.pdf',
    fileSize: 302080,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Конфликт интересов и порядок его урегулирования',
    description: 'Как определить конфликт интересов и какие действия должен предпринять работник.',
    fileName: 'anti-corruption-07.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-07.pdf',
    fileSize: 346112,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Подарки и вознаграждения: что запрещено',
    description: 'Разъяснение ограничений на получение подарков, услуг и иных вознаграждений.',
    fileName: 'anti-corruption-08.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-08.pdf',
    fileSize: 289792,
    category: 'Памятки',
  },
  {
    title: 'Памятка. Куда сообщать о фактах коррупции',
    description: 'Контакты и порядок сообщения о коррупционных проявлениях.',
    fileName: 'anti-corruption-09.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-09.pdf',
    fileSize: 275456,
    category: 'Памятки',
  },
  {
    title: 'Федеральный закон от 25.12.2008 № 273-ФЗ «О противодействии коррупции»',
    description: 'Базовый федеральный закон о правовых и организационных основах противодействия коррупции.',
    fileName: 'anti-corruption-10.pdf',
    fileUrl: 'https://www.consultant.ru/document/cons_doc_LAW_82959/',
    fileSize: 348160,
    category: 'Нормативные документы',
  },
  {
    title: 'Федеральный закон от 17.07.2009 № 172-ФЗ «Об антикоррупционной экспертизе нормативных правовых актов»',
    description: 'Документ о проведении антикоррупционной экспертизы нормативных правовых актов и проектов.',
    fileName: 'anti-corruption-11.pdf',
    fileUrl: 'https://www.consultant.ru/document/cons_doc_LAW_89553/',
    fileSize: 331776,
    category: 'Нормативные документы',
  },
  {
    title: 'Уголовный кодекс Российской Федерации: статьи о коррупционных преступлениях',
    description: 'Извлечения из УК РФ по статьям 204, 290, 291, 291.1 и смежным составам.',
    fileName: 'anti-corruption-12.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-12.pdf',
    fileSize: 421888,
    category: 'Нормативные документы',
  },
  {
    title: 'Кодекс Российской Федерации об административных правонарушениях: незаконное вознаграждение',
    description: 'Материалы об административной ответственности за незаконное вознаграждение от имени юридического лица.',
    fileName: 'anti-corruption-13.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-13.pdf',
    fileSize: 392192,
    category: 'Нормативные документы',
  },
  {
    title: 'Трудовой кодекс Российской Федерации: ограничения и обязанности работников',
    description: 'Извлечения из трудового законодательства об ограничениях, обязанностях и конфликте интересов.',
    fileName: 'anti-corruption-14.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-14.pdf',
    fileSize: 356352,
    category: 'Нормативные документы',
  },
  {
    title: 'Гражданский кодекс Российской Федерации: последствия коррупционных сделок',
    description: 'Разъяснение гражданско-правовых последствий сделок, совершенных с коррупционной целью.',
    fileName: 'anti-corruption-15.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-15.pdf',
    fileSize: 337920,
    category: 'Нормативные документы',
  },
  {
    title: 'Федеральный закон от 27.07.2004 № 79-ФЗ «О государственной гражданской службе Российской Федерации»',
    description: 'Ограничения, запреты и обязанности в системе государственной гражданской службы.',
    fileName: 'anti-corruption-16.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-16.pdf',
    fileSize: 458752,
    category: 'Нормативные документы',
  },
  {
    title: 'Федеральный закон от 02.03.2007 № 25-ФЗ «О муниципальной службе в Российской Федерации»',
    description: 'Ограничения, запреты и обязанности в системе муниципальной службы.',
    fileName: 'anti-corruption-17.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-17.pdf',
    fileSize: 446464,
    category: 'Нормативные документы',
  },
  {
    title: 'Национальный план противодействия коррупции',
    description: 'Основные направления реализации государственной политики в сфере противодействия коррупции.',
    fileName: 'anti-corruption-18.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-18.pdf',
    fileSize: 503808,
    category: 'Нормативные документы',
  },
  {
    title: 'Методические рекомендации по вопросам противодействия коррупции',
    description: 'Рекомендации для работников учреждения по соблюдению запретов, ограничений и обязанностей.',
    fileName: 'anti-corruption-19.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-19.pdf',
    fileSize: 401408,
    category: 'Нормативные документы',
  },
  {
    title: 'Антикоррупционная политика учреждения',
    description: 'Локальный документ о системе мер предупреждения коррупции в учреждении.',
    fileName: 'anti-corruption-20.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-20.pdf',
    fileSize: 374784,
    category: 'Нормативные документы',
  },
  {
    title: 'Положение о предотвращении и урегулировании конфликта интересов',
    description: 'Локальный порядок выявления, предотвращения и урегулирования конфликта интересов.',
    fileName: 'anti-corruption-21.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-21.pdf',
    fileSize: 362496,
    category: 'Нормативные документы',
  },
  {
    title: 'Кодекс этики и служебного поведения работников учреждения',
    description: 'Нормы профессиональной этики и правила поведения работников учреждения.',
    fileName: 'anti-corruption-22.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-22.pdf',
    fileSize: 352256,
    category: 'Нормативные документы',
  },
  {
    title: 'План мероприятий по противодействию коррупции',
    description: 'План профилактических мероприятий и организационных мер по предупреждению коррупции.',
    fileName: 'anti-corruption-23.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-23.pdf',
    fileSize: 389120,
    category: 'Нормативные документы',
  },
  {
    title: 'Порядок уведомления работодателя о склонении к коррупционным правонарушениям',
    description: 'Порядок подачи и рассмотрения уведомлений о фактах склонения к коррупционным правонарушениям.',
    fileName: 'anti-corruption-24.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-24.pdf',
    fileSize: 368640,
    category: 'Нормативные документы',
  },
  {
    title: 'Порядок сообщения о возникновении личной заинтересованности',
    description: 'Порядок сообщения о личной заинтересованности, которая может привести к конфликту интересов.',
    fileName: 'anti-corruption-25.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-25.pdf',
    fileSize: 360448,
    category: 'Нормативные документы',
  },
  {
    title: 'Указ Президента Российской Федерации «О Национальной стратегии противодействия коррупции»',
    description: 'Документ, определяющий стратегические направления государственной антикоррупционной политики.',
    fileName: 'anti-corruption-26.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-26.pdf',
    fileSize: 413696,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Указ Президента Российской Федерации № 309 о реализации отдельных положений закона о противодействии коррупции',
    description: 'Меры реализации отдельных положений федерального законодательства о противодействии коррупции.',
    fileName: 'anti-corruption-27.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-27.pdf',
    fileSize: 397312,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Указ Президента Российской Федерации № 557 о перечнях должностей',
    description: 'Порядок определения должностей, связанных с антикоррупционными ограничениями и обязанностями.',
    fileName: 'anti-corruption-28.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-28.pdf',
    fileSize: 385024,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Указ Президента Российской Федерации № 559 о представлении сведений о доходах',
    description: 'Порядок представления сведений о доходах, расходах, имуществе и обязательствах имущественного характера.',
    fileName: 'anti-corruption-29.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-29.pdf',
    fileSize: 401408,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Указ Президента Российской Федерации № 821 о комиссиях по соблюдению требований к служебному поведению',
    description: 'Порядок работы комиссий по служебному поведению и урегулированию конфликта интересов.',
    fileName: 'anti-corruption-30.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-30.pdf',
    fileSize: 442368,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Указ Президента Российской Федерации о проверке достоверности сведений',
    description: 'Порядок проверки достоверности и полноты сведений, представляемых гражданами и должностными лицами.',
    fileName: 'anti-corruption-31.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-31.pdf',
    fileSize: 430080,
    category: 'Указы президента Российской Федерации',
  },
  {
    title: 'Постановление Правительства Российской Федерации № 96 об антикоррупционной экспертизе',
    description: 'Правила и методика проведения антикоррупционной экспертизы нормативных правовых актов.',
    fileName: 'anti-corruption-32.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-32.pdf',
    fileSize: 473088,
    category: 'Постановления правительства Российской Федерации',
  },
  {
    title: 'Постановление Правительства Российской Федерации о порядке сообщения работодателем о заключении трудового договора',
    description: 'Порядок уведомления о заключении трудового договора с бывшим государственным или муниципальным служащим.',
    fileName: 'anti-corruption-33.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-33.pdf',
    fileSize: 389120,
    category: 'Постановления правительства Российской Федерации',
  },
  {
    title: 'Постановление Правительства Российской Федерации о распространении антикоррупционных ограничений',
    description: 'Материалы о применении антикоррупционных ограничений, запретов и обязанностей.',
    fileName: 'anti-corruption-34.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-34.pdf',
    fileSize: 405504,
    category: 'Постановления правительства Российской Федерации',
  },
  {
    title: 'Постановление Правительства Российской Федерации о проверке достоверности сведений',
    description: 'Правила проверки сведений о доходах, расходах, имуществе и обязательствах имущественного характера.',
    fileName: 'anti-corruption-35.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-35.pdf',
    fileSize: 417792,
    category: 'Постановления правительства Российской Федерации',
  },
  {
    title: 'Приказ Министерства юстиции Российской Федерации об антикоррупционной экспертизе',
    description: 'Материалы Министерства юстиции Российской Федерации по вопросам антикоррупционной экспертизы.',
    fileName: 'anti-corruption-36.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-36.pdf',
    fileSize: 401408,
    category: 'Приказы министерства юстиции',
  },
  {
    title: 'Приказ Министерства юстиции Российской Федерации о независимых экспертах',
    description: 'Порядок аккредитации и работы независимых экспертов, проводящих антикоррупционную экспертизу.',
    fileName: 'anti-corruption-37.pdf',
    fileUrl: '/uploads/anti-corruption/anti-corruption-37.pdf',
    fileSize: 376832,
    category: 'Приказы министерства юстиции',
  },
];
const prosecutorData = [
  {
    title: 'Ужесточена уголовная ответственность за деяния, связанные с заключением ограничивающего конкуренцию соглашения',
    slug: 'ugolovnaya-otvetstvennost-za-ogranichivayuschee-konkurenciyu-soglashenie',
    publishedAt: new Date('2025-01-24'),
    excerpt: 'Федеральным законом от 13.12.2024 № 467-ФЗ внесены изменения в статью 178 Уголовного кодекса Российской Федерации.',
    content: `<p>Федеральным законом от 13.12.2024 № 467-ФЗ внесены изменения в статью 178 Уголовного кодекса Российской Федерации (ограничение конкуренции).</p><p>Поправками определены новые квалифицирующие признаки: ограничение конкуренции путем заключения между хозяйствующими субъектами-конкурентами ограничивающего конкуренцию соглашения, совершенное организованной группой; уничтожение или повреждение чужого имущества либо угроза таких последствий.</p><p>Определены размеры крупного дохода — свыше 80 млн рублей и особо крупного дохода — 395 млн рублей. Изменения вступили в силу 24.12.2024.</p>`,
  },
  {
    title: 'Ужесточён порядок освобождения от НДФЛ при продаже земель',
    slug: 'poryadok-osvobozhdeniya-ot-ndfl-pri-prodazhe-zemel',
    publishedAt: new Date('2025-01-23'),
    excerpt: 'Изменён порядок расчёта срока владения земельными участками, образованными в результате раздела, выдела, объединения или перераспределения.',
    content: `<p>Федеральным законом от 12.12.2024 № 449-ФЗ внесены изменения в статью 217.1 Налогового кодекса Российской Федерации.</p><p>Поправками регламентирован порядок расчёта срока владения землёй, если она была образована в результате раздела, выдела, объединения или перераспределения исходных земельных участков.</p><p>Изменения вступили в силу 01.01.2025.</p>`,
  },
  {
    title: 'Общее собрание в многоквартирном доме может проводиться с использованием портала Госуслуг',
    slug: 'obschee-sobranie-mkd-cherez-gosuslugi',
    publishedAt: new Date('2025-01-22'),
    excerpt: 'В Жилищный кодекс внесены изменения о проведении общих собраний с использованием Единого портала государственных услуг.',
    content: `<p>Федеральным законом от 13.12.2024 № 463-ФЗ внесены изменения в Жилищный кодекс Российской Федерации.</p><p>Для целей проведения собственниками помещений в многоквартирном доме общего собрания возможно использование федеральной государственной информационной системы «Единый портал государственных и муниципальных услуг».</p><p>Изменения вступают в силу 01.03.2025.</p>`,
  },
  {
    title: 'Договоры дарения недвижимости подлежат обязательному нотариальному удостоверению',
    slug: 'dogovory-dareniya-nedvizhimosti-notarialnoe-udostoverenie',
    publishedAt: new Date('2025-01-21'),
    excerpt: 'Договор дарения недвижимого имущества, заключенный между гражданами, теперь подлежит нотариальному удостоверению.',
    content: `<p>Федеральным законом от 13.12.2024 № 459-ФЗ внесены изменения в пункт 3 статьи 574 Гражданского кодекса Российской Федерации.</p><p>Договор дарения недвижимого имущества, заключенный между гражданами, теперь подлежит нотариальному удостоверению. Ранее такие сделки заключались в простой письменной форме.</p><p>Изменения направлены на пресечение мошеннических схем с недвижимостью и вступили в силу 13.01.2025.</p>`,
  },
  {
    title: 'Введена административная ответственность за незаконное привлечение инвестиций физических лиц',
    slug: 'administrativnaya-otvetstvennost-za-nezakonnoe-privlechenie-investiciy',
    publishedAt: new Date('2025-01-20'),
    excerpt: 'В Кодекс Российской Федерации об административных правонарушениях введена статья 14.56.1.',
    content: `<p>Федеральным законом от 13.12.2024 № 461-ФЗ в Кодекс Российской Федерации об административных правонарушениях введена статья 14.56.1.</p><p>Административная ответственность наступает за оказание услуг по привлечению инвестиций физических лиц лицом, не имеющим права на осуществление указанной деятельности, а также за привлечение инвестиций физических лиц с нарушением требований закона.</p><p>За указанные административные правонарушения может быть назначено наказание вплоть до административного приостановления деятельности и штрафы до 500 тысяч рублей.</p>`,
  },
  {
    title: 'Введена уголовная ответственность за незаконное использование компьютерной информации, содержащей персональные данные',
    slug: 'ugolovnaya-otvetstvennost-za-nezakonnoe-ispolzovanie-personalnyh-dannyh',
    publishedAt: new Date('2024-12-11'),
    excerpt: 'В Уголовный кодекс Российской Федерации введена новая статья 272.1.',
    content: `<p>Федеральным законом от 30.11.2024 № 421-ФЗ в Уголовный кодекс Российской Федерации введена новая статья 272.1.</p><p>Статья предусматривает уголовную ответственность за распространение персональных данных без согласия субъекта, незаконный сбор, обработку, передачу третьим лицам и разглашение персональных данных.</p><p>Санкция статьи предполагает наказание вплоть до лишения свободы на срок до 10 лет со штрафом до 3 млн рублей. Изменения вступили в силу 11.12.2024.</p>`,
  },
];

async function upsertHome() {
  for (const item of homeSettings) {
    await prisma.homePage.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
  }
}

async function upsertAdmin() {
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@kino75.ru', adminEmail],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });
}

async function replaceNews() {
  await prisma.news.deleteMany({
    where: {
      slug: {
        in: [
          'premera-zabaikalskie-istorii',
          'grant-dokumentalnyy-film',
          'festival-amurskaya-osen',
          ...newsData.map((item) => item.slug),
        ],
      },
    },
  });

  for (const item of newsData) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: { ...item, published: true },
      create: { ...item, published: true },
    });
  }
}

async function replaceCinemas() {
  await prisma.cinema.deleteMany({});

  for (const item of cinemasData) {
    await prisma.cinema.create({
      data: {
        ...item,
        active: true,
      },
    });
  }
}

async function replaceAntiCorruption() {
  await prisma.antiCorruption.deleteMany({});

  for (const item of antiCorruptionData) {
    await prisma.antiCorruption.create({
      data: {
        ...item,
        publishedAt: new Date(),
      },
    });
  }
}

async function replaceProsecutor() {
  await prisma.prosecutorExplanation.deleteMany({});

  for (const item of prosecutorData) {
    await prisma.prosecutorExplanation.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
}


async function syncCounters() {
  const [newsCount, cinemasCount, servicesCount, documentsCount] = await Promise.all([
    prisma.news.count(),
    prisma.cinema.count({ where: { active: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.antiCorruption.count(),
  ]);

  const counters = [
    { key: 'stats_news_value', value: String(newsCount) },
    { key: 'stats_news_label', value: 'новостей' },
    { key: 'stats_cinemas_value', value: String(cinemasCount) },
    { key: 'stats_cinemas_label', value: 'кинотеатров' },
    { key: 'stats_services_value', value: String(servicesCount) },
    { key: 'stats_services_label', value: 'услуг' },
    { key: 'stats_documents_value', value: String(documentsCount) },
    { key: 'stats_documents_label', value: 'документов' },
  ];

  for (const item of counters) {
    await prisma.homePage.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
  }
}

async function main() {
  console.log('Обновляю главную и подвал...');
  await upsertHome();

  console.log('Меняю администратора...');
  await upsertAdmin();

  console.log('Заполняю новости с изображениями...');
  await replaceNews();

  console.log('Заполняю кинотеатры вручную...');
  await replaceCinemas();

  console.log('Заполняю раздел противодействия коррупции...');
  await replaceAntiCorruption();

  console.log('Заполняю раздел прокурор разъясняет...');
  await replaceProsecutor();

  console.log('Обновляю счетчики главной и админки...');
  await syncCounters();

  console.log('Готово. Данные обновлены.');
}

main()
  .catch((error) => {
    console.error('Ошибка при обновлении данных:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
