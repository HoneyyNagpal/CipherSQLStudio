/**
 * Assignment definitions.
 * In a full production system, these would live in MongoDB.
 * For simplicity, they're defined here and served via the assignments route.
 * Admins would add new assignments here or via an admin panel.
 */

const ASSIGNMENTS = [
  {
    id: 'asgn_001',
    title: 'Customer Orders Report',
    difficulty: 'easy',
    tags: ['SELECT', 'JOIN', 'WHERE'],
    description: 'Pull customers by city, find February orders, and total up revenue from delivered orders.',
    question: `You are working with an e-commerce database. Answer the following:

1. List all customers from Mumbai along with their email addresses.

2. Find all orders placed in February 2024, showing the order ID, order date, customer name, and status.

3. Calculate the total revenue from all "delivered" orders. Show the total amount.

4. List the top 3 most expensive products with their names, categories, and prices.`,
    tables: ['customers', 'orders', 'order_items', 'products'],
    hints: [
      'Remember: customers and orders are linked by customer_id',
      'For revenue calculation, you need to multiply quantity by unit_price in order_items',
      'Use ORDER BY with LIMIT to get top results',
    ],
    expectedConcepts: ['SELECT', 'WHERE', 'JOIN', 'SUM', 'ORDER BY', 'LIMIT', 'BETWEEN'],
  },

  {
    id: 'asgn_002',
    title: 'Advanced Joins & Aggregations',
    difficulty: 'medium',
    tags: ['JOIN', 'GROUP BY', 'HAVING', 'Subquery'],
    description: 'Find repeat customers, rank categories by revenue, and spot customers who never ordered.',
    question: `Using the e-commerce database, write queries to:

1. Find all customers who have placed MORE than 1 order. Show their name, email, and order count.

2. For each product category, calculate the total quantity sold and total revenue. Sort by total revenue descending.

3. Find customers who have NEVER placed an order (use a subquery or LEFT JOIN).

4. List the most popular product (highest total quantity sold across all orders) with its total quantity.`,
    tables: ['customers', 'orders', 'order_items', 'products'],
    hints: [
      'GROUP BY customer allows counting orders per customer',
      'HAVING filters groups (like WHERE but for aggregates)',
      'LEFT JOIN with NULL check finds records with no matching rows',
    ],
    expectedConcepts: ['GROUP BY', 'HAVING', 'COUNT', 'SUM', 'LEFT JOIN', 'Subquery', 'NOT IN'],
  },

  {
    id: 'asgn_003',
    title: 'Employee Salary Analysis',
    difficulty: 'medium',
    tags: ['JOIN', 'GROUP BY', 'Self-JOIN', 'NULL handling'],
    description: 'Compare department pay averages and match each employee to their manager, including those with none.',
    question: `You have access to an HR database with employees, departments, and salaries. Write queries to:

1. List all employees with their department name and current salary (where to_date IS NULL means current).

2. Find the average salary per department. Show department name and average salary, sorted by average salary descending.

3. List all employees along with their manager's name. Employees without a manager should still appear (show NULL for manager name).

4. Find all employees hired in 2022 or later. Show their name, job title, and hire date.`,
    tables: ['employees', 'departments', 'salaries'],
    hints: [
      'Self-join: JOIN employees AS manager ON employees.manager_id = manager.emp_id',
      'Current salary has to_date IS NULL',
      'LEFT JOIN ensures employees without managers still appear',
    ],
    expectedConcepts: ['JOIN', 'LEFT JOIN', 'Self-JOIN', 'IS NULL', 'AVG', 'GROUP BY', 'DATE filtering'],
  },

  {
    id: 'asgn_004',
    title: 'Library Overdue Tracker',
    difficulty: 'hard',
    tags: ['DATE functions', 'CASE WHEN', 'Subquery', 'Window Functions'],
    description: 'Flag overdue books by days late, find the most-borrowed title, and label each loan as on time, late, or active.',
    question: `Using the library database with members, books, and borrowings:

1. Find all currently borrowed books (return_date IS NULL). Show member name, book title, due date, and how many days overdue they are (use CURRENT_DATE).

2. For each member, show their name, total books borrowed, and total books currently borrowed. Include members with zero borrowings.

3. Find the most borrowed book (highest number of times borrowed). Show title, author, and borrow count.

4. Using a CASE WHEN, categorize each borrowing as 'returned on time', 'returned late', or 'still borrowed' based on return_date and due_date.`,
    tables: ['members', 'books', 'borrowings'],
    hints: [
      'CURRENT_DATE - due_date gives days overdue',
      'COUNT with GROUP BY counts borrowings per book',
      'CASE WHEN return_date IS NULL handles still-borrowed; compare dates for late/on-time',
    ],
    expectedConcepts: ['DATE arithmetic', 'CASE WHEN', 'IS NULL', 'COUNT', 'GROUP BY', 'Subquery'],
  },

  {
    id: 'asgn_005',
    title: 'Window Functions & CTEs',
    difficulty: 'hard',
    tags: ['CTE', 'Window Functions', 'RANK', 'ROW_NUMBER'],
    description: 'Rank employees by salary within their department, track running revenue over time, and find the runner-up product in each category.',
    question: `Using the e-commerce and HR databases, write queries using CTEs and window functions:

1. Using a CTE, find customers whose total spending is above the average total spending across all customers.

2. Rank employees within each department by their salary (highest = rank 1). Show employee name, department, salary, and their rank.

3. For each order, show the order_id, customer name, order total, and the running total of revenue across all orders sorted by order date.

4. Find the second most expensive product in each category using ROW_NUMBER or RANK.`,
    tables: ['customers', 'orders', 'order_items', 'products', 'employees', 'departments', 'salaries'],
    hints: [
      'WITH cte_name AS (SELECT ...) SELECT * FROM cte_name',
      'RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)',
      'SUM() OVER (ORDER BY order_date) gives running total',
      'ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) = 2 for second most expensive',
    ],
    expectedConcepts: ['CTE', 'RANK()', 'ROW_NUMBER()', 'SUM() OVER', 'Window Functions', 'PARTITION BY'],
  },
];

module.exports = ASSIGNMENTS;