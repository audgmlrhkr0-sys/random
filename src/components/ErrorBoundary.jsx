import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>앱을 불러오지 못했습니다</h1>
          <p style={{ color: '#c0392b', marginTop: '1rem' }}>{this.state.error.message}</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            GitHub Pages → Source가 <strong>GitHub Actions</strong> 인지 확인하세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
