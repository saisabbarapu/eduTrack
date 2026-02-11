"""
ML Service entry: reads JSON from stdin, dispatches to correct module, writes JSON to stdout.
Node spawns this script and communicates via stdin/stdout.
"""
import sys
import json

def main():
    try:
        line = sys.stdin.readline()
        if not line:
            sys.exit(1)
        req = json.loads(line.strip())
        task = req.get('type', '')
        data = req.get('data', {})

        if task == 'delay':
            from delay_predict import predict_delay
            out = predict_delay(data)
        elif task == 'duplicate':
            from duplicate_detect import check_duplicate
            out = check_duplicate(data)
        elif task == 'performance':
            from performance_risk import performance_risk
            out = performance_risk(data)
        else:
            out = {'error': 'Unknown type: ' + task}

        print(json.dumps(out))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == '__main__':
    main()
