let canvas;
let context;

let data;
let ani;


onmessage = (evt) => {
    if (evt.data.canvas) {
        canvas = evt.data.canvas;
        context = canvas.getContext("2d");

        canvas.width = evt.data.width;
        canvas.height = evt.data.height;
    }

    if (evt.data.data) {
        data = evt.data.data;

        let render = (time) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            // ... some drawing using the gl context ...
            let barWidth = (evt.data.width / data.length) * 4.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < data.length; i++) {
                barHeight = data[i];

                context.fillStyle = 'rgb(' + (barHeight + 100) + ',107,210)';
                context.fillRect(
                    x,
                    evt.data.height - barHeight * 4,
                    barWidth,
                    barHeight * 4
                );

                x += barWidth + 1;
            }

            if (!ani) {
                ani = requestAnimationFrame(render);
            }
        }
        requestAnimationFrame(render);
    }

    // ... some drawing using the gl context ...
};