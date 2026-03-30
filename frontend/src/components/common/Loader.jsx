const Loader = ({ size = 40, message = '' }) => {
  return (
    <div className="loader-wrapper" style={{ flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: size, height: size }} />
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</p>}
    </div>
  );
};

export default Loader;
