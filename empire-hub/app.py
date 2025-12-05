"""
═══════════════════════════════════════════════════════════════
EMPIRE HUB - Unified Control Dashboard
Central monitoring and control for all Empire services
═══════════════════════════════════════════════════════════════
"""

import os
import requests
from datetime import datetime
from flask import Flask, render_template, jsonify
from prometheus_client import Counter, Gauge, generate_latest, REGISTRY
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

SERVICES = {
    'ggloop': {
        'name': 'GG Loop Platform',
        'url': os.getenv('GGLOOP_URL', 'http://localhost:5000'),
        'health_endpoint': '/health',
        'type': 'webapp',
        'icon': '🎮',
        'external_url': 'http://localhost:3000'
    },
    'prometheus': {
        'name': 'Prometheus',
        'url': os.getenv('PROMETHEUS_URL', 'http://localhost:9090'),
        'health_endpoint': '/-/healthy',
        'type': 'monitoring',
        'icon': '📊',
        'external_url': 'http://localhost:9090'
    },
    'grafana': {
        'name': 'Grafana',
        'url': os.getenv('GRAFANA_URL', 'http://localhost:3030'),
        'health_endpoint': '/api/health',
        'type': 'monitoring',
        'icon': '📈',
        'external_url': 'http://localhost:3030'
    },
    'loki': {
        'name': 'Loki',
        'url': 'http://localhost:3100',
        'health_endpoint': '/ready',
        'type': 'monitoring',
        'icon': '📝',
        'external_url': 'http://localhost:3100'
    },
    'options-hunter': {
        'name': 'Options Hunter',
        'url': os.getenv('OPTIONS_HUNTER_URL', 'http://options-hunter:8501'),
        'health_endpoint': '/health',
        'type': 'analytics',
        'icon': '📉',
        'external_url': 'http://localhost:8501'
    },
    'antisocial-bot': {
        'name': 'Antisocial Bot',
        'url': os.getenv('ANTISOCIAL_BOT_URL', 'http://antisocial-bot:3001'),
        'health_endpoint': '/health',
        'type': 'automation',
        'icon': '🤖',
        'external_url': 'http://localhost:3001'
    },
}

PROMETHEUS_URL = os.getenv('PROMETHEUS_URL', 'http://prometheus:9090')
GRAFANA_URL = os.getenv('GRAFANA_URL', 'http://grafana:3000')

# ═══════════════════════════════════════════════════════════════
# METRICS
# ═══════════════════════════════════════════════════════════════

hub_requests = Counter('empire_hub_requests_total', 'Total requests to Empire Hub')
service_health = Gauge('empire_hub_service_health', 'Service health status (1=healthy, 0=unhealthy)', ['service'])

# ═══════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/')
def index():
    """Main dashboard page"""
    hub_requests.inc()
    return render_template('dashboard.html', 
                          services=SERVICES,
                          grafana_url=GRAFANA_URL,
                          prometheus_url=PROMETHEUS_URL)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/services/status')
def services_status():
    """Get health status of all services"""
    hub_requests.inc()
    statuses = {}
    
    for service_id, service in SERVICES.items():
        try:
            url = f"{service['url']}{service['health_endpoint']}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                statuses[service_id] = {
                    'status': 'healthy',
                    'name': service['name'],
                    'type': service['type'],
                    'response_time': response.elapsed.total_seconds(),
                    'details': response.json() if response.headers.get('content-type') == 'application/json' else None
                }
                service_health.labels(service=service_id).set(1)
            else:
                statuses[service_id] = {
                    'status': 'degraded',
                    'name': service['name'],
                    'type': service['type'],
                    'error': f'HTTP {response.status_code}'
                }
                service_health.labels(service=service_id).set(0)
                
        except requests.RequestException as e:
            statuses[service_id] = {
                'status': 'down',
                'name': service['name'],
                'type': service['type'],
                'error': str(e)
            }
            service_health.labels(service=service_id).set(0)
    
    return jsonify(statuses)

@app.route('/api/metrics/summary')
def metrics_summary():
    """Get aggregated metrics from Prometheus"""
    hub_requests.inc()
    
    try:
        # Query Prometheus for key metrics
        queries = {
            'total_users': 'ggloop_active_users_total',
            'total_revenue': 'sum(ggloop_revenue_usd_total)',
            'active_subscriptions': 'ggloop_active_subscriptions',
            'api_requests': 'sum(rate(ggloop_api_errors_total[5m]))',
        }
        
        results = {}
        for key, query in queries.items():
            try:
                response = requests.get(
                    f"{PROMETHEUS_URL}/api/v1/query",
                    params={'query': query},
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get('data', {}).get('result'):
                        value = data['data']['result'][0]['value'][1]
                        results[key] = float(value)
                    else:
                        results[key] = 0
                else:
                    results[key] = None
            except:
                results[key] = None
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/links')
def service_links():
    """Get quick access links to all services"""
    links = {}
    for service_id, service in SERVICES.items():
        if service.get('external_url'):
            links[service_id] = {
                'name': service['name'],
                'url': service['external_url'],
                'icon': service.get('icon', '🔗'),
                'type': service['type']
            }
    return jsonify(links)

# ═══════════════════════════════════════════════════════════════
# CAPTAIN'S LOG (NOTES)
# ═══════════════════════════════════════════════════════════════

NOTES_FILE = 'captains_log.json'

def load_notes():
    if os.path.exists(NOTES_FILE):
        try:
            import json
            with open(NOTES_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_notes(notes):
    import json
    with open(NOTES_FILE, 'w') as f:
        json.dump(notes, f, indent=2)

@app.route('/api/notes', methods=['GET'])
def get_notes():
    return jsonify(load_notes())

@app.route('/api/notes', methods=['POST'])
def add_note():
    from flask import request
    data = request.json
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing content'}), 400
    
    notes = load_notes()
    new_note = {
        'id': int(datetime.utcnow().timestamp() * 1000),
        'content': data['content'],
        'timestamp': datetime.utcnow().isoformat(),
        'type': data.get('type', 'log')  # log, intel, mission
    }
    notes.insert(0, new_note)  # Newest first
    save_notes(notes)
    return jsonify(new_note)

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    notes = load_notes()
    notes = [n for n in notes if n['id'] != note_id]
    save_notes(notes)
    return jsonify({'success': True})

# ═══════════════════════════════════════════════════════════════
# MISSION OBJECTIVES (PRIORITY TRACKER)
# ═══════════════════════════════════════════════════════════════

MISSIONS_FILE = 'missions.json'

def load_missions():
    if os.path.exists(MISSIONS_FILE):
        try:
            import json
            with open(MISSIONS_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_missions(missions):
    import json
    with open(MISSIONS_FILE, 'w') as f:
        json.dump(missions, f, indent=2)

@app.route('/api/missions', methods=['GET'])
def get_missions():
    return jsonify(load_missions())

@app.route('/api/missions', methods=['POST'])
def add_mission():
    from flask import request
    data = request.json
    if not data or 'title' not in data:
        return jsonify({'error': 'Missing title'}), 400
    
    missions = load_missions()
    new_mission = {
        'id': int(datetime.utcnow().timestamp() * 1000),
        'title': data['title'],
        'priority': data.get('priority', 'medium'), # high, medium, low
        'status': 'pending',
        'timestamp': datetime.utcnow().isoformat()
    }
    missions.append(new_mission)
    save_missions(missions)
    return jsonify(new_mission)

@app.route('/api/missions/<int:mission_id>', methods=['PUT'])
def update_mission(mission_id):
    from flask import request
    data = request.json
    missions = load_missions()
    for mission in missions:
        if mission['id'] == mission_id:
            if 'priority' in data:
                mission['priority'] = data['priority']
            if 'status' in data:
                mission['status'] = data['status']
            save_missions(missions)
            return jsonify(mission)
    return jsonify({'error': 'Mission not found'}), 404

@app.route('/api/missions/<int:mission_id>', methods=['DELETE'])
def delete_mission(mission_id):
    missions = load_missions()
    missions = [m for m in missions if m['id'] != mission_id]
    save_missions(missions)
    return jsonify({'success': True})

# ═══════════════════════════════════════════════════════════════
# INTEL FEED (ANTISOCIAL BOT)
# ═══════════════════════════════════════════════════════════════

@app.route('/api/intel')
def get_intel():
    """Fetch logs from Antisocial Bot"""
    try:
        url = f"{SERVICES['antisocial-bot']['url']}/api/logs"
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify([])
    except:
        return jsonify([])

# ═══════════════════════════════════════════════════════════════
# TREASURY (REVENUE DASHBOARD)
# ═══════════════════════════════════════════════════════════════

@app.route('/api/treasury')
def get_treasury():
    """Get detailed treasury/revenue data"""
    # Mock data for now - in production this would query Stripe/Database
    return jsonify({
        'daily_revenue': 1250.00,
        'monthly_revenue': 45000.00,
        'projected_revenue': 54000.00,
        'recent_transactions': [
            {'id': 'TXN-001', 'amount': 99.00, 'user': 'Agent Smith', 'time': '10:42 AM', 'status': 'completed'},
            {'id': 'TXN-002', 'amount': 29.00, 'user': 'Neo', 'time': '10:38 AM', 'status': 'completed'},
            {'id': 'TXN-003', 'amount': 199.00, 'user': 'Trinity', 'time': '10:15 AM', 'status': 'completed'},
            {'id': 'TXN-004', 'amount': 99.00, 'user': 'Morpheus', 'time': '09:55 AM', 'status': 'completed'},
            {'id': 'TXN-005', 'amount': 29.00, 'user': 'Cypher', 'time': '09:30 AM', 'status': 'failed'}
        ]
    })

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(REGISTRY), 200, {'Content-Type': 'text/plain; charset=utf-8'}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
