/**
 * Seed Script for PostgreSQL Sandbox
 * 
 * This creates the sample tables and data for all assignments.
 * Run once: node utils/seedPostgres.js
 * 
 * In production, admins would use this or a migration tool.
 */

require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'honeynagpal',
  password: '',
  database: 'ciphersql_sandbox',
});

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting PostgreSQL seed...');

    // ─── Assignment 1: E-commerce Basics ───────────────────────────────────────
    await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
    `);

    await client.query(`
      CREATE TABLE customers (
        customer_id SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        city        VARCHAR(80),
        joined_at   DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE products (
        product_id  SERIAL PRIMARY KEY,
        name        VARCHAR(150) NOT NULL,
        category    VARCHAR(60),
        price       NUMERIC(10, 2) NOT NULL,
        stock       INTEGER DEFAULT 0
      );

      CREATE TABLE orders (
        order_id    SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(customer_id),
        order_date  DATE NOT NULL,
        status      VARCHAR(30) DEFAULT 'pending'
      );

      CREATE TABLE order_items (
        item_id     SERIAL PRIMARY KEY,
        order_id    INTEGER REFERENCES orders(order_id),
        product_id  INTEGER REFERENCES products(product_id),
        quantity    INTEGER NOT NULL,
        unit_price  NUMERIC(10, 2) NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO customers (name, email, city, joined_at) VALUES
        ('Arjun Mehta',    'arjun@example.com',   'Mumbai',    '2022-01-15'),
        ('Priya Sharma',   'priya@example.com',    'Delhi',     '2022-03-20'),
        ('Rahul Verma',    'rahul@example.com',    'Bangalore', '2021-11-05'),
        ('Sneha Patel',    'sneha@example.com',    'Ahmedabad', '2023-02-14'),
        ('Karan Singh',    'karan@example.com',    'Mumbai',    '2022-07-30'),
        ('Divya Nair',     'divya@example.com',    'Chennai',   '2021-09-12'),
        ('Amit Joshi',     'amit@example.com',     'Pune',      '2023-05-01'),
        ('Neha Gupta',     'neha@example.com',     'Delhi',     '2022-12-25');

      INSERT INTO products (name, category, price, stock) VALUES
        ('Wireless Mouse',       'Electronics',  599.00,  150),
        ('Mechanical Keyboard',  'Electronics', 2499.00,   80),
        ('USB-C Hub',            'Electronics', 1299.00,  200),
        ('Standing Desk',        'Furniture',   8999.00,   25),
        ('Ergonomic Chair',      'Furniture',  12999.00,   15),
        ('Notebook Pack',        'Stationery',   199.00,  500),
        ('Whiteboard Markers',   'Stationery',    99.00,  300),
        ('Laptop Stand',         'Electronics',  799.00,  120);

      INSERT INTO orders (customer_id, order_date, status) VALUES
        (1, '2024-01-10', 'delivered'),
        (2, '2024-01-15', 'delivered'),
        (3, '2024-02-01', 'shipped'),
        (1, '2024-02-20', 'delivered'),
        (4, '2024-03-05', 'pending'),
        (5, '2024-03-10', 'delivered'),
        (2, '2024-03-15', 'shipped'),
        (6, '2024-04-01', 'pending'),
        (7, '2024-04-10', 'delivered'),
        (3, '2024-04-20', 'delivered');

      INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
        (1, 1, 2,  599.00),
        (1, 3, 1, 1299.00),
        (2, 2, 1, 2499.00),
        (3, 4, 1, 8999.00),
        (4, 8, 2,  799.00),
        (5, 6, 5,  199.00),
        (6, 5, 1, 12999.00),
        (7, 1, 1,  599.00),
        (7, 7, 3,   99.00),
        (8, 3, 2, 1299.00),
        (9, 2, 1, 2499.00),
        (10, 8, 1, 799.00),
        (10, 1, 3, 599.00);
    `);

    // ─── Assignment 2: Employee HR Database ───────────────────────────────────
    await client.query(`
      DROP TABLE IF EXISTS salaries CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS departments CASCADE;
    `);

    await client.query(`
      CREATE TABLE departments (
        dept_id   SERIAL PRIMARY KEY,
        name      VARCHAR(100) NOT NULL,
        location  VARCHAR(80)
      );

      CREATE TABLE employees (
        emp_id      SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        dept_id     INTEGER REFERENCES departments(dept_id),
        manager_id  INTEGER REFERENCES employees(emp_id),
        hire_date   DATE NOT NULL,
        job_title   VARCHAR(80)
      );

      CREATE TABLE salaries (
        salary_id   SERIAL PRIMARY KEY,
        emp_id      INTEGER REFERENCES employees(emp_id),
        amount      NUMERIC(12, 2) NOT NULL,
        from_date   DATE NOT NULL,
        to_date     DATE
      );
    `);

    await client.query(`
      INSERT INTO departments (name, location) VALUES
        ('Engineering',   'Bangalore'),
        ('Marketing',     'Mumbai'),
        ('HR',            'Delhi'),
        ('Finance',       'Mumbai'),
        ('Product',       'Bangalore');

      INSERT INTO employees (name, dept_id, manager_id, hire_date, job_title) VALUES
        ('Rohan Das',     1, NULL, '2018-06-01', 'CTO'),
        ('Kavitha R',     1, 1,    '2019-03-15', 'Senior Engineer'),
        ('Suresh Kumar',  1, 1,    '2020-07-20', 'Engineer'),
        ('Meena Iyer',    2, NULL, '2017-11-10', 'Marketing Head'),
        ('Varun Nath',    2, 4,    '2021-01-05', 'Marketing Executive'),
        ('Anita Rao',     3, NULL, '2016-04-22', 'HR Manager'),
        ('Deepak Jain',   4, NULL, '2018-09-30', 'Finance Head'),
        ('Pooja Menon',   5, NULL, '2019-12-01', 'Product Manager'),
        ('Ravi Shankar',  1, 2,    '2022-08-15', 'Junior Engineer'),
        ('Lata Pillai',   5, 8,    '2023-01-20', 'Associate PM');

      INSERT INTO salaries (emp_id, amount, from_date, to_date) VALUES
        (1,  250000, '2018-06-01', NULL),
        (2,  120000, '2019-03-15', '2021-03-14'),
        (2,  145000, '2021-03-15', NULL),
        (3,   90000, '2020-07-20', NULL),
        (4,  130000, '2017-11-10', NULL),
        (5,   75000, '2021-01-05', NULL),
        (6,  110000, '2016-04-22', NULL),
        (7,  160000, '2018-09-30', NULL),
        (8,  140000, '2019-12-01', NULL),
        (9,   65000, '2022-08-15', NULL),
        (10,  70000, '2023-01-20', NULL);
    `);

    // ─── Assignment 3: Library Management ─────────────────────────────────────
    await client.query(`
      DROP TABLE IF EXISTS borrowings CASCADE;
      DROP TABLE IF EXISTS books CASCADE;
      DROP TABLE IF EXISTS members CASCADE;
    `);

    await client.query(`
      CREATE TABLE members (
        member_id   SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150),
        joined_date DATE DEFAULT CURRENT_DATE,
        active      BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE books (
        book_id     SERIAL PRIMARY KEY,
        title       VARCHAR(200) NOT NULL,
        author      VARCHAR(150) NOT NULL,
        genre       VARCHAR(60),
        year        INTEGER,
        copies      INTEGER DEFAULT 1
      );

      CREATE TABLE borrowings (
        borrow_id     SERIAL PRIMARY KEY,
        member_id     INTEGER REFERENCES members(member_id),
        book_id       INTEGER REFERENCES books(book_id),
        borrow_date   DATE NOT NULL,
        return_date   DATE,
        due_date      DATE NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO members (name, email, joined_date, active) VALUES
        ('Aisha Khan',      'aisha@lib.com',   '2020-01-10', TRUE),
        ('Rajan Tiwari',    'rajan@lib.com',   '2020-03-22', TRUE),
        ('Sunita Bose',     'sunita@lib.com',  '2021-07-14', FALSE),
        ('Manav Chandra',   'manav@lib.com',   '2022-02-28', TRUE),
        ('Preethi S',       'preethi@lib.com', '2022-09-05', TRUE);

      INSERT INTO books (title, author, genre, year, copies) VALUES
        ('The Pragmatic Programmer', 'David Thomas',      'Technology', 1999, 3),
        ('Clean Code',               'Robert C. Martin',  'Technology', 2008, 2),
        ('Sapiens',                  'Yuval Noah Harari', 'History',    2011, 4),
        ('The Alchemist',            'Paulo Coelho',      'Fiction',    1988, 5),
        ('Atomic Habits',            'James Clear',       'Self-Help',  2018, 3),
        ('Deep Work',                'Cal Newport',       'Self-Help',  2016, 2),
        ('1984',                     'George Orwell',     'Fiction',    1949, 3);

      INSERT INTO borrowings (member_id, book_id, borrow_date, return_date, due_date) VALUES
        (1, 1, '2024-01-05', '2024-01-19', '2024-01-19'),
        (1, 3, '2024-02-01', NULL,          '2024-02-15'),
        (2, 2, '2024-01-10', '2024-01-24', '2024-01-24'),
        (2, 5, '2024-03-01', NULL,          '2024-03-15'),
        (3, 4, '2023-12-01', '2023-12-14', '2023-12-15'),
        (4, 6, '2024-02-20', NULL,          '2024-03-05'),
        (5, 7, '2024-01-15', '2024-01-28', '2024-01-29'),
        (1, 5, '2024-03-10', NULL,          '2024-03-24'),
        (4, 1, '2024-03-15', NULL,          '2024-03-29');
    `);

    console.log('✅ PostgreSQL seed complete!');
    console.log('   Tables created: customers, products, orders, order_items');
    console.log('   Tables created: departments, employees, salaries');
    console.log('   Tables created: members, books, borrowings');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
