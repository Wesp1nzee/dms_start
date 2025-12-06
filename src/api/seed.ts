/**
 * Seed initial data on first load
 */

import { mockApi } from './mockApi';

const SEED_KEY = 'db_seeded_v1';

export const seedDatabase = async (): Promise<void> => {
  // Check if already seeded
  if (localStorage.getItem(SEED_KEY)) {
    return;
  }

  try {
    // Create templates
    const contractTemplate = await mockApi.createTemplate(
      'Типовой договор поставки',
      'Стандартный договор поставки с основными условиями',
      `<h2>ДОГОВОР ПОСТАВКИ</h2>
<p>Между {{supplier_name}} (Поставщик) и {{buyer_name}} (Покупатель)</p>
<h3>1. Предмет договора</h3>
<p>Поставщик обязуется поставить товар: {{product_name}} количеством {{quantity}} в объеме {{amount}} рублей.</p>
<h3>2. Сроки поставки</h3>
<p>Товар будет поставлен не позднее {{delivery_date}}.</p>
<h3>3. Условия оплаты</h3>
<p>Оплата производится {{payment_terms}} после получения товара.</p>
<p>Подписано: {{date}}</p>`
    );

    await mockApi.createTemplate(
      'Отчет по ведению дела',
      'Шаблон отчета по ведению дела',
      `<h2>ОТЧЕТ ПО ВЕДЕНИЮ ДЕЛА</h2>
<p><strong>Номер дела:</strong> {{case_number}}</p>
<p><strong>Ответственный:</strong> {{responsible}}</p>
<p><strong>Сторона:</strong> {{counterparty}}</p>
<h3>Описание</h3>
<p>{{description}}</p>
<h3>Текущий статус</h3>
<p>{{status}}</p>
<p>Последнее обновление: {{last_update}}</p>`
    );

    // Create test documents
    if (contractTemplate.success && contractTemplate.data) {
      await mockApi.generateFromTemplate(
        contractTemplate.data.id,
        {
          supplier_name: 'ООО "Поставщик"',
          buyer_name: 'ООО "Покупатель"',
          product_name: 'Офисная мебель',
          quantity: '100 шт.',
          amount: '150000',
          delivery_date: '15.01.2024',
          payment_terms: '50% авансом, 50% при получении',
          date: new Date().toLocaleDateString('ru-RU'),
        },
        {
          title: 'Договор поставки мебели',
          type: 'contract',
          contract_number: 'ДП-2024-001',
          counterparty: 'ООО "Поставщик"',
        }
      );
    }

    await mockApi.createDocument('Дело по иску о взыскании задолженности', 'case', {
      case_number: 'А40-123456/2024',
      expertise_type: 'civil',
      responsible: 'Иванов И.И.',
    });

    await mockApi.createDocument('Договор лицензионного соглашения', 'agreement', {
      contract_number: 'ЛС-2024-001',
      counterparty: 'ООО "СофтТек"',
      expertise_type: 'ip',
    });

    // Create settings
    await mockApi.updateSettings({
      counterparties: [
        {
          id: '1',
          name: 'ООО "Поставщик"',
          address: 'г. Москва, ул. Главная, д. 1',
          contactPerson: 'Петров П.П.',
          phone: '+7 (495) 123-45-67',
          email: 'info@supplier.ru',
        },
        {
          id: '2',
          name: 'ООО "Покупатель"',
          address: 'г. Санкт-Петербург, ул. Невская, д. 10',
          contactPerson: 'Сидоров С.С.',
          phone: '+7 (812) 987-65-43',
          email: 'info@buyer.ru',
        },
        {
          id: '3',
          name: 'ООО "СофтТек"',
          address: 'г. Москва, ул. Техническая, д. 5',
          contactPerson: 'Смирнов В.В.',
        },
      ],
      users: [
        {
          id: '1',
          name: 'Иванов Иван Иванович',
          role: 'admin',
          position: 'Главный юрист',
        },
        {
          id: '2',
          name: 'Петров Петр Петрович',
          role: 'lawyer',
          position: 'Старший юрист',
        },
        {
          id: '3',
          name: 'Сидоров Сергей Сергеевич',
          role: 'lawyer',
          position: 'Юрист',
        },
      ],
      enableOCR: true,
      useTesseract: false,
    });

    localStorage.setItem(SEED_KEY, 'true');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};
