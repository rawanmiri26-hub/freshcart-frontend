import './ContactUs.css';

export default function ContactUs() {
  return (
    <div className="container section">
      <h1 className="page-title">Contact us</h1>
      <p className="page-subtitle">For any inquiry you can visit us or contact our head office.</p>

      <div className="contact-grid">
        <div className="contact-item">
          <span className="contact-icon">📍</span>
          <div>
            <h3>FreshCart Downtown</h3>
            <p>452 Market St, Central Valley, CA 90210</p>
          </div>
        </div>

        <div className="contact-item">
          <span className="contact-icon">🎧</span>
          <div>
            <h3>Customer support</h3>
            <p>Phone support: +961 1 888 888</p>
            <p>Direct call: +961 81 001 001</p>
          </div>
        </div>

        <div className="contact-item">
          <span className="contact-icon">📞</span>
          <div>
            <h3>Phone</h3>
            <p>+961 1 555 555</p>
            <p>+961 1 666 666</p>
            <p>+961 1 777 777</p>
          </div>
        </div>

        <div className="contact-item">
          <span className="contact-icon">✉️</span>
          <div>
            <h3>Email</h3>
            <p>info@freshcart-dt.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
