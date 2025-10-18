import { useState, useEffect } from 'react'
import './App.css'

interface ResumeItem {
  id?: number;
  skill: string;
  description: string;
}

const API_URL = 'http://localhost:8000';

function App() {
  const [resumeItems, setResumeItems] = useState<ResumeItem[]>([]);
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  // Check API health
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data.status === 'healthy' ? 'Connected ✓' : 'Error'))
      .catch(() => setApiStatus('Disconnected ✗'));
  }, []);

  // Fetch resume items
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/resume`);
      const data = await response.json();
      setResumeItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new resume item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !description) return;

    try {
      const response = await fetch(`${API_URL}/api/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, description }),
      });
      const newItem = await response.json();
      setResumeItems([...resumeItems, newItem]);
      setSkill('');
      setDescription('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Delete resume item
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/resume/${id}`, { method: 'DELETE' });
      setResumeItems(resumeItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Align AI</h1>
        <p className="tagline">Align your resume and skills to land the job</p>
        <div className="api-status">API Status: {apiStatus}</div>
      </header>

      <main>
        <section className="add-item">
          <h2>Add Resume Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <button type="submit">Add Item</button>
          </form>
        </section>

        <section className="items-list">
          <h2>Resume Items ({resumeItems.length})</h2>
          {resumeItems.length === 0 ? (
            <p className="empty-message">No items yet. Add your first skill!</p>
          ) : (
            <div className="items-grid">
              {resumeItems.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.skill}</h3>
                  <p>{item.description}</p>
                  <button 
                    onClick={() => item.id && handleDelete(item.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
