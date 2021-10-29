import React from 'react';
import './Breakout.scss';
import { useGetList, useDelete } from 'react-shared';
import { shuffle } from './shuffle';

const colors = {
  ConfigMap: 'blue',
  Pod: 'green',
  Secret: 'red',
  StatefulSet: 'purple',
  ReplicaSet: '#0a6ed1',
};

class Paddle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tX = x;
    this.pX = x;
  }

  moveTo(x) {
    this.tX = x;
  }

  update(deltaTime) {
    const newX = this.x + (this.tX - this.x) * deltaTime * 6;
    this.pX = this.x;
    this.x = newX;
  }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
  }
}

class Ball {
  constructor(r, speed = 300) {
    this.r = r;
    this.speed = speed;

    this.reset();
  }

  randomizeDirection() {
    const a = Math.PI / 4 + (Math.random() * Math.PI) / 2;
    this.vX = Math.cos(a) * this.speed;
    this.vY = Math.sin(a) * this.speed;
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;

    this.randomizeDirection();
  }

  update(deltaTime) {
    this.x += this.vX * deltaTime;
    this.y += this.vY * deltaTime;

    if (this.x - this.r < 0) {
      this.vX = -this.vX;
      this.x = this.r;
    }

    if (this.x + this.r > canvas.width) {
      this.vX = -this.vX;
      this.x = canvas.width - this.r;
    }

    if (this.y - this.r < 0) {
      this.vY = -this.vY;
      this.y = this.r;
    }

    if (
      this.y + this.r > paddle.y &&
      this.x + this.r > paddle.x - paddle.width / 2 &&
      this.x - this.r < paddle.x + paddle.width / 2
    ) {
      this.vY = -this.vY;
      this.y = paddle.y - paddle.height / 2 - 5;
      this.vX -= (paddle.pX - paddle.x) * 10;
    }

    for (const block of blocks) {
      if (!block.active) continue;
      if (
        this.y + this.r > block.y - block.height / 2 &&
        this.x > block.x - block.width / 2 &&
        this.x < block.x + block.width / 2
      ) {
        this.vY *= -1; //top
      }
      if (
        this.x - this.r < block.x + block.width / 2 &&
        this.y > block.y - block.height / 2 &&
        this.y < block.y + block.height / 2
      ) {
        this.vX *= -1; //right
      }
      if (
        this.y - this.r > block.y + block.height / 2 &&
        this.x > block.x - block.width / 2 &&
        this.x < block.x + block.width / 2
      ) {
        this.vY *= -1; //bottom
      }
      if (
        this.x + this.r < block.x - block.width / 2 &&
        this.y > block.y - block.height / 2 &&
        this.y < block.y + block.height / 2
      ) {
        this.vX *= -1; //left
      }
      if (
        this.x + this.r > block.x - block.width / 2 &&
        this.x - this.r < block.x + block.width / 2 &&
        this.y + this.r > block.y - block.height / 2 &&
        this.y - this.r < block.y + block.height / 2
      ) {
        block.active = false;
        block.resource.delete();
        break;
      }
    }

    if (this.y + this.r > canvas.height) {
      reset();
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Block {
  constructor(x, y, width, height, resource) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.resource = resource;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = colors[this.resource.type] || 'black';
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
    ctx.strokeStyle = 'white';
    ctx.strokeText(
      this.resource.metadata.name.substring(0, 10),
      this.x - this.width / 2,
      this.y,
    );
  }
}

let canvas;
let ctx;
let paddle;
let ball;
let blocks;
let resources;
let isRunning = false;

function createBlocks() {
  const w = 60;
  const h = 30;
  const spacing = 10;
  blocks = [];
  let ii = 0;
  for (let j = 20; j < 200; j += h + 40) {
    for (let i = 50; i < canvas.width; i += w + spacing) {
      if (ii < resources.length) {
        blocks.push(new Block(i, j, w, h, resources[ii]));
        ii++;
      }
    }
    for (let i = 80; i < canvas.width - 30; i += w + spacing) {
      if (ii < resources.length) {
        blocks.push(new Block(i, j + 35, w, h, resources[ii]));
        ii++;
      }
    }
  }
}

function reset() {
  ball.reset();
  createBlocks();

  isRunning = false;
}

function init(_canvas, _resources) {
  canvas = _canvas;
  ctx = canvas.getContext('2d');
  paddle = new Paddle(canvas.width / 2, canvas.height - 10, 100, 10);
  ball = new Ball(10);
  resources = _resources;
  createBlocks();
}

function refreshCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paddle.draw(ctx);
  ball.draw(ctx);

  for (const block of blocks) {
    block.draw(ctx);
  }

  if (!isRunning) {
    ctx.strokeStyle = 'black';
    ctx.strokeText('Click to start', canvas.width / 2, canvas.height / 2);
  }
}

function update(deltaTime) {
  ball.update(deltaTime);
  paddle.update(deltaTime);
}

function run(time) {
  const nTime = Date.now();
  const deltaTime = (nTime - time) / 1000;

  if (document.hasFocus() && deltaTime < 0.4 && isRunning) {
    update(deltaTime);
  }
  refreshCanvas();

  window.requestAnimationFrame(() => run(nTime));
}

function onMouseMove(x) {
  paddle && paddle.moveTo(x);
}

export function Breakout() {
  const canvasRef = React.useRef(null);
  const [log, setLog] = React.useState([]);

  const { data: pods } = useGetList()('/api/v1/namespaces/kyma-system/pods');
  const { data: cms } = useGetList()(
    '/api/v1/namespaces/kyma-system/configmaps',
  );
  const { data: secrets } = useGetList()(
    '/api/v1/namespaces/kyma-system/secrets',
  );
  const { data: statefulSets } = useGetList()(
    '/apis/apps/v1/namespaces/kyma-system/statefulsets',
  );
  const { data: replicasets } = useGetList()(
    '/apis/apps/v1/namespaces/kyma-system/replicasets/',
  );

  const deleteRequest = useDelete();

  React.useEffect(() => {
    if (
      canvasRef.current &&
      pods &&
      cms &&
      secrets &&
      statefulSets &&
      replicasets
    ) {
      const resources = [
        ...pods.map(p => ({
          ...p,
          type: 'Pod',
          delete: () =>
            deleteRequest(
              '/api/v1/namespaces/kyma-system/pods/' + p.metadata.name,
            )
              .then(() => setLog(log => [...log, 'del Po ' + p.metadata.name]))
              .catch(console.log),
        })),
        ...cms.map(cm => ({
          ...cm,
          type: 'ConfigMap',
          delete: () =>
            deleteRequest(
              '/api/v1/namespaces/kyma-system/configmaps/' + cm.metadata.name,
            )
              .then(() => setLog(log => [...log, 'del CM ' + cm.metadata.name]))
              .catch(console.log),
        })),
        ...secrets.map(s => ({
          ...s,
          type: 'Secret',
          delete: () =>
            deleteRequest(
              '/api/v1/namespaces/kyma-system/secrets/' + s.metadata.name,
            )
              .then(() =>
                setLog(log => [...log, 'del Secret ' + s.metadata.name]),
              )
              .catch(console.log),
        })),
        ...statefulSets.map(sS => ({
          ...sS,
          type: 'StatefulSet',
          delete: () =>
            deleteRequest(
              '/apis/apps/v1/namespaces/kyma-system/statefulsets/' +
                sS.metadata.name,
            )
              .then(() =>
                setLog(log => [...log, 'del StatefulSet ' + sS.metadata.name]),
              )
              .catch(console.log),
        })),
        ...replicasets.map(rS => ({
          ...rS,
          type: 'ReplicaSet',
          delete: () =>
            deleteRequest(
              '/apis/apps/v1/namespaces/kyma-system/replicasets/' +
                rS.metadata.name,
            )
              .then(() =>
                setLog(log => [...log, 'del ReplicaSet ' + rS.metadata.name]),
              )
              .catch(console.log),
        })),
      ];
      shuffle(resources);
      init(canvasRef.current, resources);
      run(new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current, pods, cms, secrets, statefulSets, replicasets]);

  return (
    <>
      <canvas
        width={800}
        height={600}
        ref={canvasRef}
        onMouseMove={e => onMouseMove(e.clientX)}
        onClick={() => {
          setLog([]);
          isRunning = true;
        }}
      ></canvas>
      {log.map(l => (
        <p key={l}>{l}</p>
      ))}
    </>
  );
}
