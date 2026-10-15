// Detailed SVG geographic vector paths for Spain (Mainland, Baleares, and Canarias inset)
// Coordinates calibrated for viewBox="0 0 1000 750"

export const SPAIN_MAP_SVG = {
  viewBox: '0 0 1000 750',

  // Península Ibérica: Territorio de España continental
  mainlandSpain: `
    M 215 105
    C 230 110, 270 120, 310 122
    C 340 124, 380 126, 420 128
    C 450 128, 480 133, 510 138
    C 535 142, 560 148, 575 152
    C 585 152, 600 156, 620 158
    C 645 160, 680 162, 720 168
    C 760 174, 800 182, 835 198
    C 850 205, 868 214, 875 220
    C 880 225, 878 238, 865 245
    C 852 252, 842 270, 830 295
    C 818 318, 800 342, 780 365
    C 768 378, 755 385, 750 388
    C 740 395, 730 405, 722 420
    C 712 438, 705 455, 715 475
    C 722 485, 725 492, 718 505
    C 710 520, 700 535, 690 550
    C 685 560, 680 570, 672 575
    C 660 585, 645 600, 630 615
    C 615 628, 602 642, 595 650
    C 585 660, 565 668, 545 670
    C 525 672, 495 672, 470 675
    C 445 678, 420 685, 400 698
    C 392 705, 388 710, 385 712
    C 380 710, 372 700, 365 692
    C 355 680, 340 672, 325 665
    C 310 658, 290 652, 275 648
    C 265 645, 260 635, 258 610
    C 255 580, 256 550, 258 520
    C 260 490, 268 470, 270 450
    C 272 430, 260 410, 250 390
    C 240 370, 235 340, 230 320
    C 225 300, 215 270, 205 250
    C 195 242, 175 240, 155 242
    C 142 245, 138 238, 140 225
    C 142 210, 145 198, 148 185
    C 152 168, 165 150, 180 135
    C 192 122, 202 110, 215 105
    Z
  `,

  // Frontera / Territorio de Portugal (atenuado para dar contexto peninsular realista)
  portugalBorder: `
    M 140 240
    C 150 240, 175 240, 205 250
    C 215 270, 225 300, 230 320
    C 235 340, 240 370, 250 390
    C 260 410, 272 430, 270 450
    C 268 470, 260 490, 258 520
    C 256 550, 255 580, 258 610
    C 260 635, 265 645, 275 648
    C 255 650, 235 650, 215 645
    C 190 640, 180 620, 175 580
    C 170 540, 175 500, 170 450
    C 165 400, 150 370, 145 340
    C 140 310, 135 275, 140 240
    Z
  `,

  // Islas Baleares
  baleares: {
    mallorca: `
      M 840 405
      C 850 395, 870 398, 885 410
      C 895 420, 892 435, 880 445
      C 868 452, 850 445, 842 432
      C 835 422, 832 412, 840 405
      Z
    `,
    menorca: `
      M 915 370
      C 928 368, 942 375, 940 388
      C 938 395, 922 396, 912 388
      C 908 382, 908 375, 915 370
      Z
    `,
    ibiza: `
      M 790 455
      C 802 450, 815 460, 810 475
      C 805 482, 792 485, 786 475
      C 782 468, 784 458, 790 455
      Z
    `,
    formentera: `
      M 792 492
      C 802 490, 810 498, 805 508
      C 800 512, 790 512, 788 505
      C 786 498, 788 493, 792 492
      Z
    `,
  },

  // Archipiélago Canario (recuadro inset elegante)
  canariasInset: {
    box: { x: 45, y: 550, width: 220, height: 165 },
    islands: {
      tenerife: `
        M 105 650
        C 118 642, 132 655, 125 670
        C 120 678, 105 680, 98 670
        C 94 662, 98 654, 105 650
        Z
      `,
      granCanaria: `
        M 140 660
        C 152 658, 160 670, 155 682
        C 150 690, 138 690, 132 680
        C 128 672, 132 662, 140 660
        Z
      `,
      lanzarote: `
        M 200 615
        C 210 610, 218 622, 212 635
        C 208 640, 198 638, 195 628
        C 193 620, 196 616, 200 615
        Z
      `,
      fuerteventura: `
        M 185 635
        C 195 638, 198 655, 192 672
        C 188 680, 178 682, 175 670
        C 172 658, 178 642, 185 635
        Z
      `,
      laPalma: `
        M 65 625
        C 74 622, 76 638, 72 650
        C 68 655, 60 652, 60 642
        C 60 632, 62 626, 65 625
        Z
      `,
      laGomera: `
        M 80 665
        C 88 663, 90 672, 86 678
        C 82 682, 75 680, 75 674
        C 75 668, 77 665, 80 665
        Z
      `,
      elHierro: `
        M 58 675
        C 66 672, 68 682, 64 688
        C 60 692, 54 690, 54 684
        C 54 678, 56 675, 58 675
        Z
      `,
    },
  },

  // Sombreado de relieve físico (cordilleras estilizadas con volumen)
  reliefShades: [
    {
      id: 'relief-pirineos',
      name: 'Pirineos',
      path: 'M 580 155 Q 670 158 750 172 T 850 205 L 835 225 Q 730 198 650 186 Z',
      elevation: 'high',
    },
    {
      id: 'relief-cantabrica',
      name: 'Cordillera Cantábrica',
      path: 'M 250 165 Q 350 142 450 158 T 540 172 L 530 190 Q 430 174 340 166 Z',
      elevation: 'high',
    },
    {
      id: 'relief-sistema-central',
      name: 'Sistema Central',
      path: 'M 270 370 Q 360 342 450 322 T 520 310 L 510 328 Q 430 346 345 368 Z',
      elevation: 'high',
    },
    {
      id: 'relief-sistema-iberico',
      name: 'Sistema Ibérico',
      path: 'M 505 235 Q 555 275 585 335 T 635 425 L 615 435 Q 565 355 535 295 Z',
      elevation: 'medium',
    },
    {
      id: 'relief-sierra-morena',
      name: 'Sierra Morena',
      path: 'M 280 532 Q 380 526 480 522 T 545 526 L 540 542 Q 445 538 355 546 Z',
      elevation: 'medium',
    },
    {
      id: 'relief-beticas',
      name: 'Cordilleras Béticas',
      path: 'M 405 662 Q 485 642 585 602 T 675 552 L 665 572 Q 565 622 485 660 Z',
      elevation: 'high',
    },
    {
      id: 'relief-montes-toledo',
      name: 'Montes de Toledo',
      path: 'M 335 444 Q 405 440 475 435 L 470 448 Q 400 452 340 456 Z',
      elevation: 'low',
    },
    {
      id: 'relief-macizo-galaico',
      name: 'Macizo Galaico',
      path: 'M 165 152 Q 215 156 228 190 T 182 216 Z',
      elevation: 'medium',
    },
  ],
};
