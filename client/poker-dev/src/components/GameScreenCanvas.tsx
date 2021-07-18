import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import React from "react";
import TABLE from "../assets/table.png";
import CHIP from "../assets/chip.png";
import BANK from "../assets/bank.png";

const tableImgSrc = TABLE;
const chipImgSrc = CHIP;
const bankImgSrc = BANK;

function importAll(r: __WebpackModuleApi.RequireContext): Record<string, any> {
    const images: Record<string, any> = {};
    r.keys().forEach((item, index) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
}

const allCards = importAll(require.context("../assets/cards", false, /\.png/));

export const GameScreenCanvas = observer(() => {
    const players = useStore("Players");
    const game = useStore("Game");
    const controller = useStore("Controller");

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    const tableImgRef = React.useRef<HTMLImageElement | null>(null);

    const chipImgRef = React.useRef<HTMLImageElement | null>(null);
    const bankImgRef = React.useRef<HTMLImageElement | null>(null);

    const cardsRefs: Record<
        string,
        React.MutableRefObject<HTMLImageElement | null>
    > = {};
    Object.keys(allCards).forEach((card) => {
        const cardStr = card.replace(".png", "");
        cardsRefs[cardStr] = React.useRef<HTMLImageElement | null>(null);
    });

    function roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
    ): void {
        const r = x + w;
        const b = y + h;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + h - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    function playerRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
    ): void {
        roundRect(ctx, x, y, w, h, radius);
        ctx.lineWidth = 5;
        ctx.fillStyle = "rgb(79, 86, 99)";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgb(145, 156, 179)";
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w - ctx.lineWidth, y + h / 2);
        ctx.stroke();
    }

    function drawPlayerCard(
        ctx: CanvasRenderingContext2D,
        posX: number,
        posY: number,
        timer: boolean,
        id: string
    ): void {
        const gradient = ctx.createLinearGradient(
            posX,
            posY,
            posX + 200,
            posY + 70
        );

        gradient.addColorStop(0, "rgb(0, 100, 255)");
        gradient.addColorStop(0.5101, "rgb(182, 184, 180)");
        gradient.addColorStop(1, "rgb(0, 100, 255)");

        ctx.strokeStyle = gradient;
        playerRect(ctx, posX, posY, 200, 70, 20);

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = gradient;
        ctx.arc(posX, posY + 35, 45, 0, 2 * Math.PI);

        ctx.fillStyle = "rgb(79, 86, 99)";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (timer) {
            ctx.font = "40px Open Sans";
            ctx.fillText(controller.turnTime.toString(), posX, posY + 35);
        }

        ctx.font = "25px Open Sans";
        ctx.fillText(players.players[id].name!, posX + 115, posY + 19);
        ctx.fillText(
            players.players[id].stack!.toString(),
            posX + 115,
            posY + 55
        );
    }

    const draw = (timestamp: number) => {
        if (!ctxRef.current || !canvasRef.current) {
            return;
        }
        const { current: canvas } = canvasRef;
        const { current: ctx } = ctxRef;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //background
        const backgroundGradient = ctx.createLinearGradient(
            0,
            canvas.height,
            0,
            0
        );
        backgroundGradient.addColorStop(0, "rgb(46, 107, 29)");
        backgroundGradient.addColorStop(0.2323, "rgb(46, 107, 29)");
        backgroundGradient.addColorStop(1, "rgb(69, 203, 71)");
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (tableImgRef.current) {
            const tableWidth = 800;
            const ratio =
                tableImgRef.current.height / tableImgRef.current.width;
            ctx.drawImage(
                tableImgRef.current,
                100,
                100,
                tableWidth,
                tableWidth * ratio
            );
        }

        ctx.save();
        drawPlayerCard(
            ctx,
            150,
            70,
            controller.opponentTimer,
            players.opponentId
        );
        ctx.restore();

        ctx.save();
        drawPlayerCard(
            ctx,
            canvas.width - 300,
            canvas.height - 200,
            controller.playerTimer,
            players.clientId
        );
        ctx.restore();

        roundRect(ctx, 200, 5, 600, 25, 5);
        const messageStrokeGradient = ctx.createLinearGradient(
            200,
            30,
            600,
            25
        );
        messageStrokeGradient.addColorStop(0, "rgb(0, 0, 0)");
        messageStrokeGradient.addColorStop(
            0.51010101010101,
            "rgb(147, 147, 147)"
        );
        messageStrokeGradient.addColorStop(1, "rgb(0, 0, 0)");
        ctx.fillStyle = "rgb(79, 86, 99)";
        ctx.lineWidth = 3;
        ctx.strokeStyle = messageStrokeGradient;
        ctx.fill();
        ctx.stroke();

        if (game.message.length) {
            ctx.save();
            ctx.font = "15px Open Sans";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(game.message, 500, 20);
            ctx.restore();
        }

        if (chipImgRef.current) {
            ctx.save();
            const chipImgWidth = 60;
            const chipImgRatio =
                chipImgRef.current.height / chipImgRef.current.width;
            const chipImgHeight = chipImgWidth * chipImgRatio;

            ctx.font = "17px Open Sans";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgb(0, 0, 0)";

            if (players.players[players.opponentId].bet != null) {
                if (players.players[players.opponentId].bet! > 0) {
                    ctx.drawImage(
                        chipImgRef.current,
                        220,
                        160,
                        chipImgWidth,
                        chipImgHeight
                    );
                    ctx.fillText(
                        players.players[players.opponentId].bet!.toString(),
                        220 + chipImgWidth / 2,
                        160 + chipImgHeight / 2 + 3
                    );
                }
            }

            if (players.players[players.clientId].bet != null) {
                if (players.players[players.clientId].bet! > 0) {
                    ctx.drawImage(
                        chipImgRef.current,
                        canvas.width - 290,
                        canvas.height - 290,
                        chipImgWidth,
                        chipImgWidth * chipImgRatio
                    );
                    ctx.fillText(
                        players.players[players.clientId].bet!.toString(),
                        canvas.width - 290 + chipImgWidth / 2,
                        canvas.height - 290 + chipImgHeight / 2 + 3
                    );
                }
            }
            ctx.restore();
        }

        ctx.save();

        roundRect(ctx, 450, 70, 100, 35, 5);
        const bankStrokeGradient = ctx.createLinearGradient(200, 30, 600, 25);
        bankStrokeGradient.addColorStop(0, "rgb(0, 0, 0)");
        bankStrokeGradient.addColorStop(0.51010101010101, "rgb(147, 147, 147)");
        bankStrokeGradient.addColorStop(1, "rgb(0, 0, 0)");
        ctx.fillStyle = "rgb(79, 86, 99)";
        ctx.lineWidth = 3;
        ctx.strokeStyle = bankStrokeGradient;
        ctx.fill();
        ctx.stroke();

        ctx.font = "20px Open Sans";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("Bank", 500, 89);

        ctx.restore();

        if (game.currentBank > 0) {
            if (bankImgRef.current) {
                ctx.save();
                const bankImgWidth = 60;
                const bankImgRatio =
                    bankImgRef.current.height / bankImgRef.current.width;
                const bankImgHeight = bankImgWidth * bankImgRatio;

                ctx.drawImage(
                    bankImgRef.current,
                    475,
                    115,
                    bankImgWidth,
                    bankImgHeight
                );

                ctx.font = "20px Open Sans";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fillText(game.currentBank.toString(), 450 + 50, 180);
                ctx.restore();
            }
        }

        //drawing player cards
        if (players.players[players.clientId].cards != null) {
            if (players.players[players.clientId].cards![0] != null) {
                if (
                    cardsRefs[players.players[players.clientId].cards![0]]
                        .current
                ) {
                    const cardImgWidth = 80;
                    const cardImgRatio =
                        cardsRefs[players.players[players.clientId].cards![0]]
                            .current!.height /
                        cardsRefs[players.players[players.clientId].cards![0]]
                            .current!.width;
                    const cardImgHeight = cardImgWidth * cardImgRatio;
                    ctx.save();
                    ctx.rotate((-20 * Math.PI) / 180);
                    ctx.drawImage(
                        cardsRefs[players.players[players.clientId].cards![0]]
                            .current!,
                        300,
                        587,
                        cardImgWidth,
                        cardImgHeight
                    );
                    ctx.restore();
                }
            }

            if (players.players[players.clientId].cards![1] != null) {
                if (
                    cardsRefs[players.players[players.clientId].cards![1]]
                        .current
                ) {
                    const cardImgWidth = 80;
                    const cardImgRatio =
                        cardsRefs[players.players[players.clientId].cards![1]]
                            .current!.height /
                        cardsRefs[players.players[players.clientId].cards![1]]
                            .current!.width;
                    const cardImgHeight = cardImgWidth * cardImgRatio;
                    ctx.save();
                    ctx.rotate((20 * Math.PI) / 180);
                    ctx.drawImage(
                        cardsRefs[players.players[players.clientId].cards![1]]
                            .current!,
                        690,
                        200,
                        cardImgWidth,
                        cardImgHeight
                    );
                    ctx.restore();
                }
            }

            if (
                players.players[players.opponentId].cards == null ||
                players.players[players.opponentId].cards!.length === 0
            ) {
                if (cardsRefs["back"].current) {
                    const cardImgWidth = 80;
                    const cardImgRatio =
                        cardsRefs["back"].current!.height /
                        cardsRefs["back"].current!.width;
                    const cardImgHeight = cardImgWidth * cardImgRatio;
                    ctx.save();
                    ctx.rotate((-20 * Math.PI) / 180);
                    ctx.drawImage(
                        cardsRefs["back"].current!,
                        -50,
                        170,
                        cardImgWidth,
                        cardImgHeight
                    );
                    ctx.restore();
                    ctx.save();
                    ctx.rotate((20 * Math.PI) / 180);
                    ctx.drawImage(
                        cardsRefs["back"].current!,
                        155,
                        105,
                        cardImgWidth,
                        cardImgHeight
                    );
                    ctx.restore();
                }
            } else {
                if (players.players[players.opponentId].cards![0] != null) {
                    if (
                        cardsRefs[players.players[players.opponentId].cards![0]]
                            .current
                    ) {
                        const cardImgWidth = 80;
                        const cardImgRatio =
                            cardsRefs[
                                players.players[players.opponentId].cards![0]
                            ].current!.height /
                            cardsRefs[
                                players.players[players.opponentId].cards![0]
                            ].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.rotate((-20 * Math.PI) / 180);
                        ctx.drawImage(
                            cardsRefs[
                                players.players[players.opponentId].cards![0]
                            ].current!,
                            -50,
                            170,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }
                if (players.players[players.opponentId].cards![1] != null) {
                    if (
                        cardsRefs[players.players[players.opponentId].cards![1]]
                            .current
                    ) {
                        const cardImgWidth = 80;
                        const cardImgRatio =
                            cardsRefs[
                                players.players[players.opponentId].cards![1]
                            ].current!.height /
                            cardsRefs[
                                players.players[players.opponentId].cards![1]
                            ].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.rotate((20 * Math.PI) / 180);
                        ctx.drawImage(
                            cardsRefs[
                                players.players[players.opponentId].cards![1]
                            ].current!,
                            155,
                            105,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }
            }
        }

        //drawing table cards
        if (game.table != null) {
            if (game.table.length > 0) {
                if (game.table[0] != null) {
                    if (cardsRefs[game.table[0]].current) {
                        const cardImgWidth = 70;
                        const cardImgRatio =
                            cardsRefs[game.table[0]].current!.height /
                            cardsRefs[game.table[0]].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.drawImage(
                            cardsRefs[game.table[0]].current!,
                            330,
                            220,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }

                if (game.table[1] != null) {
                    if (cardsRefs[game.table[1]].current) {
                        const cardImgWidth = 70;
                        const cardImgRatio =
                            cardsRefs[game.table[1]].current!.height /
                            cardsRefs[game.table[1]].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.drawImage(
                            cardsRefs[game.table[1]].current!,
                            330 + cardImgWidth + 3,
                            220,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }

                if (game.table[2] != null) {
                    if (cardsRefs[game.table[2]].current) {
                        const cardImgWidth = 70;
                        const cardImgRatio =
                            cardsRefs[game.table[2]].current!.height /
                            cardsRefs[game.table[2]].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.drawImage(
                            cardsRefs[game.table[2]].current!,
                            330 + cardImgWidth * 2 + 7,
                            220,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }

                if (game.table[3] != null) {
                    if (cardsRefs[game.table[3]].current) {
                        const cardImgWidth = 70;
                        const cardImgRatio =
                            cardsRefs[game.table[3]].current!.height /
                            cardsRefs[game.table[3]].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.drawImage(
                            cardsRefs[game.table[3]].current!,
                            330 + cardImgWidth * 3 + 9,
                            220,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }

                if (game.table[4] != null) {
                    if (cardsRefs[game.table[4]].current) {
                        const cardImgWidth = 70;
                        const cardImgRatio =
                            cardsRefs[game.table[4]].current!.height /
                            cardsRefs[game.table[4]].current!.width;
                        const cardImgHeight = cardImgWidth * cardImgRatio;
                        ctx.save();
                        ctx.drawImage(
                            cardsRefs[game.table[4]].current!,
                            330 + cardImgWidth * 4 + 11,
                            220,
                            cardImgWidth,
                            cardImgHeight
                        );
                        ctx.restore();
                    }
                }
            }
        }

        window.requestAnimationFrame(draw);
    };

    React.useLayoutEffect(() => {
        if (canvasRef.current) {
            ctxRef.current = canvasRef.current.getContext("2d");

            const tableImg = new Image();
            tableImg.onload = () => {
                tableImgRef.current = tableImg;
            };
            tableImg.src = tableImgSrc;

            const chipImg = new Image();
            chipImg.onload = () => {
                chipImgRef.current = chipImg;
            };
            chipImg.src = chipImgSrc;

            const bankImg = new Image();
            bankImg.onload = () => {
                bankImgRef.current = bankImg;
            };
            bankImg.src = bankImgSrc;

            const cardsImages: Record<string, HTMLImageElement> = {};

            Object.keys(allCards).forEach((card) => {
                const cardStr = card.replace(".png", "");
                cardsImages[cardStr] = new Image();
                cardsImages[cardStr].onload = () => {
                    cardsRefs[cardStr].current = cardsImages[cardStr];
                };
                cardsImages[cardStr].src = allCards[card].default;
            });

            // fix quality
            const dpr = window.devicePixelRatio || 1;
            const { width, height } = canvasRef.current.getBoundingClientRect();

            canvasRef.current.width = width * dpr;
            canvasRef.current.height = height * dpr;
            if (ctxRef.current) {
                ctxRef.current.scale(dpr, dpr);
                canvasRef.current.style.height = height + "px";
                canvasRef.current.style.width = width + "px";
            }
            window.requestAnimationFrame(draw);
        }
    });

    return (
        <div>
            <canvas width={1000} height={600} ref={canvasRef} />
        </div>
    );
});
