from dash.dependencies import Output, Input
from flask import Flask, request
import plotly.graph_objs as go
from datetime import datetime
from collections import deque
from dash import dcc, html
import json
import dash
import os

# Flask server setup
server = Flask(__name__)
app = dash.Dash(__name__, server=server)

# Deque setup for storing data points
MAX_DATA_POINTS = 1000
UPDATE_FREQ_MS = 100  # frequency of graph updates in milliseconds

# Deques for time and all sensor data
time = deque(maxlen=MAX_DATA_POINTS)

# Motion sensors
accel_x = deque(maxlen=MAX_DATA_POINTS)
accel_y = deque(maxlen=MAX_DATA_POINTS)
accel_z = deque(maxlen=MAX_DATA_POINTS)

gyro_x = deque(maxlen=MAX_DATA_POINTS)
gyro_y = deque(maxlen=MAX_DATA_POINTS)
gyro_z = deque(maxlen=MAX_DATA_POINTS)

gravity_x = deque(maxlen=MAX_DATA_POINTS)
gravity_y = deque(maxlen=MAX_DATA_POINTS)
gravity_z = deque(maxlen=MAX_DATA_POINTS)

# Orientation sensors
orientation_yaw = deque(maxlen=MAX_DATA_POINTS)
orientation_pitch = deque(maxlen=MAX_DATA_POINTS)
orientation_roll = deque(maxlen=MAX_DATA_POINTS)

# Quaternion data
quat_x = deque(maxlen=MAX_DATA_POINTS)
quat_y = deque(maxlen=MAX_DATA_POINTS)
quat_z = deque(maxlen=MAX_DATA_POINTS)
quat_w = deque(maxlen=MAX_DATA_POINTS)

# Magnetic sensors
magnetic_bearing = deque(maxlen=MAX_DATA_POINTS)
compass_bearing = deque(maxlen=MAX_DATA_POINTS)

# Audio sensor
microphone_dbfs = deque(maxlen=MAX_DATA_POINTS)

# Wrist motion sensors (Apple Watch/WearOS)
wrist_rotation_x = deque(maxlen=MAX_DATA_POINTS)
wrist_rotation_y = deque(maxlen=MAX_DATA_POINTS)
wrist_rotation_z = deque(maxlen=MAX_DATA_POINTS)

wrist_gravity_x = deque(maxlen=MAX_DATA_POINTS)
wrist_gravity_y = deque(maxlen=MAX_DATA_POINTS)
wrist_gravity_z = deque(maxlen=MAX_DATA_POINTS)

wrist_accel_x = deque(maxlen=MAX_DATA_POINTS)
wrist_accel_y = deque(maxlen=MAX_DATA_POINTS)
wrist_accel_z = deque(maxlen=MAX_DATA_POINTS)

wrist_quat_w = deque(maxlen=MAX_DATA_POINTS)
wrist_quat_x = deque(maxlen=MAX_DATA_POINTS)
wrist_quat_y = deque(maxlen=MAX_DATA_POINTS)
wrist_quat_z = deque(maxlen=MAX_DATA_POINTS)

# Uncalibrated sensors  
accel_uncal_x = deque(maxlen=MAX_DATA_POINTS)
accel_uncal_y = deque(maxlen=MAX_DATA_POINTS)
accel_uncal_z = deque(maxlen=MAX_DATA_POINTS)

gyro_uncal_x = deque(maxlen=MAX_DATA_POINTS)
gyro_uncal_y = deque(maxlen=MAX_DATA_POINTS)
gyro_uncal_z = deque(maxlen=MAX_DATA_POINTS)

magnetic_uncal_x = deque(maxlen=MAX_DATA_POINTS)
magnetic_uncal_y = deque(maxlen=MAX_DATA_POINTS)
magnetic_uncal_z = deque(maxlen=MAX_DATA_POINTS)

# Dash app layout with multiple graphs
app.layout = html.Div([
    dcc.Markdown("# Live Multi-Sensor Dashboard"),
    
    # Motion Sensors Section
    html.Div([
        html.H3("📱 Device Motion Sensors"),
        html.Div([
            dcc.Graph(id="motion_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
            dcc.Graph(id="gravity_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
        ]),
    ]),
    
    # Wrist Motion Section (Apple Watch/WearOS)
    html.Div([
        html.H3("⌚ Wrist Motion Sensors (Apple Watch/WearOS)"),
        html.Div([
            dcc.Graph(id="wrist_motion_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
            dcc.Graph(id="wrist_quaternion_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
        ]),
    ]),
    
    # Orientation Section
    html.Div([
        html.H3("🧭 Orientation & Attitude"),
        html.Div([
            dcc.Graph(id="orientation_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
            dcc.Graph(id="quaternion_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
        ]),
    ]),
    
    # Environmental Sensors Section
    html.Div([
        html.H3("🌍 Environmental Sensors"),
        html.Div([
            dcc.Graph(id="magnetic_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
            dcc.Graph(id="audio_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
        ]),
    ]),
    
    # Uncalibrated Sensors Section
    html.Div([
        html.H3("🔧 Uncalibrated/Raw Sensors"),
        html.Div([
            dcc.Graph(id="uncalibrated_motion_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
            dcc.Graph(id="uncalibrated_magnetic_graph", style={"height": "40vh", "width": "50%", "display": "inline-block"}),
        ]),
    ]),
    
        dcc.Interval(id="counter", interval=UPDATE_FREQ_MS),
], style={"padding": "20px"})

# Callback for motion sensors (accelerometer + gyroscope)
@app.callback(Output("motion_graph", "figure"), Input("counter", "n_intervals"))
def update_motion_graph(_):
    traces = []
    
    # Accelerometer traces
    if len(accel_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(accel_x), mode='lines', name='Accel X', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(accel_y), mode='lines', name='Accel Y', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(accel_z), mode='lines', name='Accel Z', line=dict(color='blue')),
        ])
    
    # Gyroscope traces
    if len(gyro_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(gyro_x), mode='lines', name='Gyro X', line=dict(color='orange', dash='dash')),
            go.Scatter(x=list(time), y=list(gyro_y), mode='lines', name='Gyro Y', line=dict(color='purple', dash='dash')),
            go.Scatter(x=list(time), y=list(gyro_z), mode='lines', name='Gyro Z', line=dict(color='brown', dash='dash')),
        ])
    
    layout = go.Layout(
        title='Accelerometer & Gyroscope',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Acceleration (m/s²) / Angular Velocity (rad/s)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for gravity sensor
@app.callback(Output("gravity_graph", "figure"), Input("counter", "n_intervals"))
def update_gravity_graph(_):
    traces = []
    
    if len(gravity_x) > 0:
        traces = [
            go.Scatter(x=list(time), y=list(gravity_x), mode='lines', name='Gravity X', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(gravity_y), mode='lines', name='Gravity Y', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(gravity_z), mode='lines', name='Gravity Z', line=dict(color='blue')),
        ]
    
    layout = go.Layout(
        title='Gravity Vector',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Gravity (m/s²)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for orientation (Euler angles)
@app.callback(Output("orientation_graph", "figure"), Input("counter", "n_intervals"))
def update_orientation_graph(_):
    traces = []
    
    if len(orientation_yaw) > 0:
        traces = [
            go.Scatter(x=list(time), y=list(orientation_yaw), mode='lines', name='Yaw', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(orientation_pitch), mode='lines', name='Pitch', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(orientation_roll), mode='lines', name='Roll', line=dict(color='blue')),
        ]
    
    layout = go.Layout(
        title='Orientation (Euler Angles)',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Angle (radians)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for quaternion data
@app.callback(Output("quaternion_graph", "figure"), Input("counter", "n_intervals"))
def update_quaternion_graph(_):
    traces = []
    
    if len(quat_x) > 0:
        traces = [
            go.Scatter(x=list(time), y=list(quat_x), mode='lines', name='Qx', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(quat_y), mode='lines', name='Qy', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(quat_z), mode='lines', name='Qz', line=dict(color='blue')),
            go.Scatter(x=list(time), y=list(quat_w), mode='lines', name='Qw', line=dict(color='orange')),
        ]
    
    layout = go.Layout(
        title='Quaternion Components',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Quaternion Value'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for magnetic sensors
@app.callback(Output("magnetic_graph", "figure"), Input("counter", "n_intervals"))
def update_magnetic_graph(_):
    traces = []
    
    if len(magnetic_bearing) > 0:
        traces.append(go.Scatter(x=list(time), y=list(magnetic_bearing), mode='lines', name='Magnetometer', line=dict(color='red')))
    
    if len(compass_bearing) > 0:
        traces.append(go.Scatter(x=list(time), y=list(compass_bearing), mode='lines', name='Compass', line=dict(color='blue', dash='dash')))
    
    layout = go.Layout(
        title='Magnetic Bearing & Compass',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Bearing (degrees)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for audio sensor
@app.callback(Output("audio_graph", "figure"), Input("counter", "n_intervals"))
def update_audio_graph(_):
    traces = []
    
    if len(microphone_dbfs) > 0:
        traces = [
            go.Scatter(x=list(time), y=list(microphone_dbfs), mode='lines', name='Audio Level', line=dict(color='purple')),
        ]
    
    layout = go.Layout(
        title='Microphone Audio Level',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='dBFS'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for wrist motion sensors  
@app.callback(Output("wrist_motion_graph", "figure"), Input("counter", "n_intervals"))
def update_wrist_motion_graph(_):
    traces = []
    
    # Wrist rotation rates
    if len(wrist_rotation_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(wrist_rotation_x), mode='lines', name='Wrist Rot X', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(wrist_rotation_y), mode='lines', name='Wrist Rot Y', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(wrist_rotation_z), mode='lines', name='Wrist Rot Z', line=dict(color='blue')),
        ])
    
    # Wrist acceleration
    if len(wrist_accel_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(wrist_accel_x), mode='lines', name='Wrist Accel X', line=dict(color='orange', dash='dash')),
            go.Scatter(x=list(time), y=list(wrist_accel_y), mode='lines', name='Wrist Accel Y', line=dict(color='purple', dash='dash')),
            go.Scatter(x=list(time), y=list(wrist_accel_z), mode='lines', name='Wrist Accel Z', line=dict(color='brown', dash='dash')),
        ])
    
    layout = go.Layout(
        title='Wrist Motion: Rotation Rate & Acceleration',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Rotation Rate (rad/s) / Acceleration (m/s²)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for wrist quaternion data
@app.callback(Output("wrist_quaternion_graph", "figure"), Input("counter", "n_intervals"))
def update_wrist_quaternion_graph(_):
    traces = []
    
    # Wrist quaternion
    if len(wrist_quat_w) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(wrist_quat_w), mode='lines', name='Wrist Qw', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(wrist_quat_x), mode='lines', name='Wrist Qx', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(wrist_quat_y), mode='lines', name='Wrist Qy', line=dict(color='blue')),
            go.Scatter(x=list(time), y=list(wrist_quat_z), mode='lines', name='Wrist Qz', line=dict(color='orange')),
        ])
    
    # Wrist gravity (scaled down for visibility with quaternion)
    if len(wrist_gravity_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(wrist_gravity_x), mode='lines', name='Wrist Grav X', line=dict(color='pink', dash='dot')),
            go.Scatter(x=list(time), y=list(wrist_gravity_y), mode='lines', name='Wrist Grav Y', line=dict(color='lightgreen', dash='dot')),
            go.Scatter(x=list(time), y=list(wrist_gravity_z), mode='lines', name='Wrist Grav Z', line=dict(color='lightblue', dash='dot')),
        ])
    
    layout = go.Layout(
        title='Wrist Motion: Quaternion & Gravity',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Quaternion Value / Gravity (m/s²)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for uncalibrated motion sensors
@app.callback(Output("uncalibrated_motion_graph", "figure"), Input("counter", "n_intervals"))
def update_uncalibrated_motion_graph(_):
    traces = []
    
    # Uncalibrated accelerometer
    if len(accel_uncal_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(accel_uncal_x), mode='lines', name='Accel Uncal X', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(accel_uncal_y), mode='lines', name='Accel Uncal Y', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(accel_uncal_z), mode='lines', name='Accel Uncal Z', line=dict(color='blue')),
        ])
    
    # Uncalibrated gyroscope
    if len(gyro_uncal_x) > 0:
        traces.extend([
            go.Scatter(x=list(time), y=list(gyro_uncal_x), mode='lines', name='Gyro Uncal X', line=dict(color='orange', dash='dash')),
            go.Scatter(x=list(time), y=list(gyro_uncal_y), mode='lines', name='Gyro Uncal Y', line=dict(color='purple', dash='dash')),
            go.Scatter(x=list(time), y=list(gyro_uncal_z), mode='lines', name='Gyro Uncal Z', line=dict(color='brown', dash='dash')),
        ])
    
    layout = go.Layout(
        title='Uncalibrated Motion Sensors',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Raw Sensor Values'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Callback for uncalibrated magnetic sensor
@app.callback(Output("uncalibrated_magnetic_graph", "figure"), Input("counter", "n_intervals"))
def update_uncalibrated_magnetic_graph(_):
    traces = []
    
    if len(magnetic_uncal_x) > 0:
    traces = [
            go.Scatter(x=list(time), y=list(magnetic_uncal_x), mode='lines', name='Mag Uncal X', line=dict(color='red')),
            go.Scatter(x=list(time), y=list(magnetic_uncal_y), mode='lines', name='Mag Uncal Y', line=dict(color='green')),
            go.Scatter(x=list(time), y=list(magnetic_uncal_z), mode='lines', name='Mag Uncal Z', line=dict(color='blue')),
    ]
    
    layout = go.Layout(
        title='Uncalibrated Magnetometer',
        xaxis=dict(title='Time', type='date'),
        yaxis=dict(title='Raw Magnetic Field (μT)'),
        margin=dict(l=50, r=50, b=50, t=50),
        showlegend=True
    )
    return {'data': traces, 'layout': layout}

# Endpoint to receive data and save it
@app.server.route("/data", methods=["POST"])
def receive_data():
    if request.method == "POST":
        raw_data = request.get_data(as_text=True)
        print(f"Received data: {raw_data}")  # Debug print statement
        
        # Save the raw data to a file
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"data/data_{timestamp}.json"
        with open(filename, 'w') as file:
            file.write(raw_data)

        # Parse the JSON data and update deques for all sensor types
        data_json = json.loads(raw_data)
        
        for d in data_json.get('payload', []):
            sensor_name = d.get("name")
            sensor_time = datetime.fromtimestamp(d["time"] / 1e9)  # Convert nanoseconds to seconds
            values = d.get("values", {})
            
            if sensor_name == "accelerometer":
                time.append(sensor_time)
                accel_x.append(values.get("x", 0))
                accel_y.append(values.get("y", 0))
                accel_z.append(values.get("z", 0))
                
            elif sensor_name == "gyroscope":
                gyro_x.append(values.get("x", 0))
                gyro_y.append(values.get("y", 0))
                gyro_z.append(values.get("z", 0))
                
            elif sensor_name == "gravity":
                gravity_x.append(values.get("x", 0))
                gravity_y.append(values.get("y", 0))
                gravity_z.append(values.get("z", 0))
                
            elif sensor_name == "orientation":
                orientation_yaw.append(values.get("yaw", 0))
                orientation_pitch.append(values.get("pitch", 0))
                orientation_roll.append(values.get("roll", 0))
                quat_x.append(values.get("qx", 0))
                quat_y.append(values.get("qy", 0))
                quat_z.append(values.get("qz", 0))
                quat_w.append(values.get("qw", 0))
                
            elif sensor_name == "magnetometer":
                magnetic_bearing.append(values.get("magneticBearing", 0))
                
            elif sensor_name == "compass":
                compass_bearing.append(values.get("magneticBearing", 0))
                
            elif sensor_name == "microphone":
                microphone_dbfs.append(values.get("dBFS", 0))
            
            # NEW: Wrist motion sensor (Apple Watch/WearOS)
            elif sensor_name == "wrist motion":
                wrist_rotation_x.append(values.get("rotationRateX", 0))
                wrist_rotation_y.append(values.get("rotationRateY", 0))
                wrist_rotation_z.append(values.get("rotationRateZ", 0))
                
                wrist_gravity_x.append(values.get("gravityX", 0))
                wrist_gravity_y.append(values.get("gravityY", 0))
                wrist_gravity_z.append(values.get("gravityZ", 0))
                
                wrist_accel_x.append(values.get("accelerationX", 0))
                wrist_accel_y.append(values.get("accelerationY", 0))
                wrist_accel_z.append(values.get("accelerationZ", 0))
                
                wrist_quat_w.append(values.get("quaternionW", 0))
                wrist_quat_x.append(values.get("quaternionX", 0))
                wrist_quat_y.append(values.get("quaternionY", 0))
                wrist_quat_z.append(values.get("quaternionZ", 0))
            
            # NEW: Uncalibrated sensors
            elif sensor_name == "accelerometeruncalibrated":
                accel_uncal_x.append(values.get("x", 0))
                accel_uncal_y.append(values.get("y", 0))
                accel_uncal_z.append(values.get("z", 0))
                
            elif sensor_name == "gyroscopeuncalibrated":
                gyro_uncal_x.append(values.get("x", 0))
                gyro_uncal_y.append(values.get("y", 0))
                gyro_uncal_z.append(values.get("z", 0))
                
            elif sensor_name == "magnetometeruncalibrated":
                magnetic_uncal_x.append(values.get("x", 0))
                magnetic_uncal_y.append(values.get("y", 0))
                magnetic_uncal_z.append(values.get("z", 0))
        
        return "success", 200
    return "failure", 400

if __name__ == "__main__":
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    app.run(debug=True, port=8000, host="0.0.0.0")



# activate the virtual environment
# source .venv/bin/activate
# run the server
# python main.py
# open the browser and go to http://localhost:8000
# start the app
# python main.py
# open the browser and go to http://localhost:8000
# pip install dash
# pip install plotly
# pip install flask
# pip install deque
# pip install datetime
# pip install json
# pip install os
# pip install dash_bootstrap_components
# pip install dash_bootstrap_components