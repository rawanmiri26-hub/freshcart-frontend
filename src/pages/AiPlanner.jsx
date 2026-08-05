import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import './AiPlanner.css';

// Note: there's no AI planning endpoint on the backend yet, so the weekly
// meal plan itself is a representative sample, shown client-side. However,
// "add all to cart" matches each market-list item against your real product
// catalog by name — so it only adds items with real, valid product ids
// (never fake ones), and tells you which items aren't in stock to match.
const WEEK_PLAN = [
  {
    day: 'Monday',
    date: 'Oct 23',
    meals: [
      { slot: 'Breakfast', name: 'Heirloom Tomato & Sourdough Toast', kcal: 320, tags: ['High Fiber', 'Plant-Based'] },
      { slot: 'Lunch', name: 'Roasted Rainbow Carrot & Quinoa Bowl', kcal: 450, tags: ['Protein Rich', 'Locally Sourced'] },
      { slot: 'Dinner', name: 'Wild-Caught Salmon with Garlic Kale', kcal: 580, tags: ['Omega-3', 'Low Carb'] },
    ],
  },
  {
    day: 'Tuesday',
    date: 'Oct 24',
    meals: [
      { slot: 'Breakfast', name: 'Greek Yogurt & Wild Blueberries', kcal: 290, tags: ['High Protein'] },
      { slot: 'Lunch', name: 'Curried Chickpea & Spinach Stew', kcal: 410, tags: ['Vegan', 'Fiber Rich'] },
      { slot: 'Dinner', name: 'Herb-Roasted Chicken & Root Veg', kcal: 620, tags: ['High Protein'] },
    ],
  },
];

const MARKET_LIST = [
  { section: 'Fresh Produce', items: [
    { name: 'Organic Heirloom Tomatoes', qty: '2 lbs' },
    { name: 'Rainbow Carrots', qty: '1 bunch' },
    { name: 'Fresh Curly Kale', qty: '2 bunches' },
  ]},
  { section: 'Pantry & Protein', items: [
    { name: 'Wild-Caught Atlantic Salmon', qty: '1.5 lbs' },
    { name: 'Tri-Color Quinoa', qty: '16 oz' },
  ]},
];

export default function AiPlanner() {
  const { addItem } = useCart();
  const [activeDay, setActiveDay] = useState(0);
  const [checked, setChecked] = useState({});
  const [added, setAdded] = useState(false);
  const [unmatched, setUnmatched] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    api
      .get('/api/products')
      .then((res) => setCatalog(res.data))
      .catch(() => setCatalog([]));
  }, []);

  const toggleItem = (name) => setChecked((prev) => ({ ...prev, [name]: !prev[name] }));

  const addAllToCart = () => {
    // Market list items are plan suggestions, not guaranteed to exist in the
    // real catalog — match by name against real products (which have real,
    // valid ids the backend will accept) instead of inventing fake ones.
    const missing = [];
    MARKET_LIST.forEach((section) => {
      section.items.forEach((item) => {
        const match = catalog.find((p) =>
          p.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (match) {
          addItem(match, 1);
        } else {
          missing.push(item.name);
        }
      });
    });
    setUnmatched(missing);
    setAdded(true);
  };

  return (
    <div className="container section">
      <div className="section-heading-row">
        <div>
          <h1 className="page-title">Your weekly harvest plan</h1>
          <p className="page-subtitle">
            Meal planning tailored to seasonal availability and your goals.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveDay((d) => (d + 1) % WEEK_PLAN.length)}>
          ✨ Regenerate plan
        </button>
      </div>

      <div className="planner-layout">
        <div className="planner-days">
          <div className="planner-day-tabs">
            {WEEK_PLAN.map((day, i) => (
              <button
                key={day.day}
                className={`planner-day-tab ${i === activeDay ? 'planner-day-tab-active' : ''}`}
                onClick={() => setActiveDay(i)}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div className="planner-day-card card">
            <div className="planner-day-header">
              <h2>{WEEK_PLAN[activeDay].day}, {WEEK_PLAN[activeDay].date}</h2>
              <span className="tag tag-fresh">Peak seasonal</span>
            </div>

            {WEEK_PLAN[activeDay].meals.map((meal) => (
              <div key={meal.slot} className="planner-meal">
                <div className="planner-meal-info">
                  <span className="planner-meal-slot">{meal.slot}</span>
                  <h3>{meal.name}</h3>
                  <div className="planner-meal-tags">
                    {meal.tags.map((t) => (
                      <span key={t} className="tag tag-neutral">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="planner-meal-kcal">{meal.kcal} kcal</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="planner-market card">
          <h2>Your market list</h2>
          <p className="page-subtitle">Curated for this week's plan</p>

          {MARKET_LIST.map((section) => (
            <div key={section.section} className="planner-market-section">
              <h4>{section.section}</h4>
              {section.items.map((item) => (
                <label key={item.name} className="planner-market-item">
                  <input
                    type="checkbox"
                    checked={!!checked[item.name]}
                    onChange={() => toggleItem(item.name)}
                  />
                  <span>{item.name}</span>
                  <span className="planner-market-qty">{item.qty}</span>
                </label>
              ))}
            </div>
          ))}

          <button className="btn btn-primary planner-add-all" onClick={addAllToCart}>
            {added ? 'Added to cart ✓' : 'One-click add all to cart'}
          </button>
          {added && unmatched.length > 0 && (
            <p className="error-text" style={{ marginTop: 12 }}>
              Not currently in stock, so skipped: {unmatched.join(', ')}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
