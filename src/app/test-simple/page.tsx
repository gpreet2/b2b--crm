export default function TestSimple() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
      <h1>TEST PAGE - If you see this, the server is working!</h1>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}