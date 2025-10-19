class MusicNotationRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Notation constants
        this.staffLineSpacing = 12;
        this.staffLines = 5;
        this.noteWidth = 20;
        this.noteSpacing = 60;
        this.marginLeft = 80;
        this.marginTop = 80;
        this.marginRight = 40;
        this.marginBottom = 40;
        
        // Time signature (default 4/4)
        this.timeSignatureNumerator = 4;
        this.timeSignatureDenominator = 4;
        
        // Note pitch to staff line mapping (middle C = C4)
        this.pitchToStaffLine = this.buildPitchMap();
        
        // Musical symbols
        this.symbols = {
            trebleClef: '𝄞',
            bassClef: '𝄢',
            sharp: '♯',
            flat: '♭',
            natural: '♮',
            wholeNote: '𝅝',
            halfNote: '𝅗𝅥',
            quarterNote: '𝅘𝅥',
            eighthNote: '𝅘𝅥𝅮',
            sixteenthNote: '𝅘𝅥𝅯',
            wholeRest: '𝄻',
            halfRest: '𝄼',
            quarterRest: '𝄽',
            eighthRest: '𝄾',
            sixteenthRest: '𝄿'
        };
        
        // Articulation symbols and techniques
        this.articulations = {
            staccato: 'staccato',      // Dot above/below note
            accent: 'accent',          // > symbol
            legato: 'legato',          // Slur/arc (drawn separately)
            pizzicato: 'pizz.',        // Text abbreviation
            arco: 'arco',              // Text
            tremolo: 'tremolo',        // Multiple slashes through stem
            sforzando: 'sfz',          // Text abbreviation
            marcato: 'marcato',        // ^ wedge symbol
            tenuto: 'tenuto'           // Horizontal line
        };
    }
    
    buildPitchMap() {
        const map = {};
        
        // Reference: B4 is on the middle line (line 3) of the treble clef
        // Staff lines from top to bottom are: F5, D5, B4, G4, E4
        // Positions: 0 = B4 (middle line), negative = higher, positive = lower
        // Each position is a half-space (half of staffLineSpacing)
        
        // Define each note's position relative to B4 = 0
        const notePositions = {
            'C': 0,  // Position in chromatic scale (not used, just for reference)
            'D': 1,
            'E': 2,
            'F': 3,
            'G': 4,
            'A': 5,
            'B': 6
        };
        
        // Map each note to its position on staff
        // Formula: position from B4 in half-steps
        const baseOctave = 4;
        const baseNote = 'B'; // B4 = position 0
        
        for (let octave = 2; octave <= 6; octave++) {
            ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach((note) => {
                const noteWithOctave = `${note}${octave}`;
                
                // Calculate semitones from B4
                const noteOrder = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11};
                const octaveDiff = octave - baseOctave;
                
                // B4 is our reference (position 0)
                // Each note's position relative to B4
                let semitones = noteOrder[note] + (octaveDiff * 12);
                if (note === 'C' || note === 'D' || note === 'E' || note === 'F' || note === 'G' || note === 'A') {
                    if (octave > baseOctave || (octave === baseOctave && note !== 'B')) {
                        semitones = noteOrder[note] - 11 + (octaveDiff * 12);
                        if (octave === baseOctave) {
                            semitones = noteOrder[note] - 11;
                        }
                    }
                }
                
                // Convert to staff position (in half-line increments)
                // Staff positions from B4: A4=1, G4=2, F4=3, E4=4, D4=5, C4=6, etc.
                let position = 0;
                
                // Simpler approach: just map each note directly
                if (note === 'B' && octave === 4) position = 0;
                else if (note === 'A' && octave === 4) position = 1;
                else if (note === 'G' && octave === 4) position = 2;
                else if (note === 'F' && octave === 4) position = 3;
                else if (note === 'E' && octave === 4) position = 4;
                else if (note === 'D' && octave === 4) position = 5;
                else if (note === 'C' && octave === 4) position = 6;
                
                // Octave 5 (above B4)
                else if (note === 'C' && octave === 5) position = -1;
                else if (note === 'D' && octave === 5) position = -2;
                else if (note === 'E' && octave === 5) position = -3;
                else if (note === 'F' && octave === 5) position = -4;
                else if (note === 'G' && octave === 5) position = -5;
                else if (note === 'A' && octave === 5) position = -6;
                else if (note === 'B' && octave === 5) position = -7;
                
                // Octave 6
                else if (note === 'C' && octave === 6) position = -8;
                else if (note === 'D' && octave === 6) position = -9;
                else if (note === 'E' && octave === 6) position = -10;
                else if (note === 'F' && octave === 6) position = -11;
                else if (note === 'G' && octave === 6) position = -12;
                else if (note === 'A' && octave === 6) position = -13;
                else if (note === 'B' && octave === 6) position = -14;
                
                // Octave 3 (below C4)
                else if (note === 'B' && octave === 3) position = 7;
                else if (note === 'A' && octave === 3) position = 8;
                else if (note === 'G' && octave === 3) position = 9;
                else if (note === 'F' && octave === 3) position = 10;
                else if (note === 'E' && octave === 3) position = 11;
                else if (note === 'D' && octave === 3) position = 12;
                else if (note === 'C' && octave === 3) position = 13;
                
                // Octave 2
                else if (note === 'B' && octave === 2) position = 14;
                else if (note === 'A' && octave === 2) position = 15;
                else if (note === 'G' && octave === 2) position = 16;
                else if (note === 'F' && octave === 2) position = 17;
                else if (note === 'E' && octave === 2) position = 18;
                else if (note === 'D' && octave === 2) position = 19;
                else if (note === 'C' && octave === 2) position = 20;
                
                map[noteWithOctave] = position;
                map[`${note}#${octave}`] = position;
                map[`${note}b${octave}`] = position;
            });
        }
        
        return map;
    }
    
    parseNote(noteString) {
        // Parse note format: "C4", "F#5", "Bb3", etc.
        const match = noteString.match(/^([A-G])(#|b)?(\d)$/);
        if (!match) return null;
        
        return {
            letter: match[1],
            accidental: match[2] || '',
            octave: parseInt(match[3]),
            fullNote: noteString
        };
    }
    
    calculateCanvasSize(noteCount) {
        const width = this.marginLeft + this.marginRight + (noteCount * this.noteSpacing) + 100;
        const height = this.marginTop + this.marginBottom + (this.staffLines * this.staffLineSpacing) + 100;
        
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    drawStaff() {
        const staffTop = this.marginTop;
        const staffWidth = this.canvas.width - this.marginLeft - this.marginRight;
        
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        
        for (let i = 0; i < this.staffLines; i++) {
            const y = staffTop + (i * this.staffLineSpacing);
            this.ctx.beginPath();
            this.ctx.moveTo(this.marginLeft, y);
            this.ctx.lineTo(this.marginLeft + staffWidth, y);
            this.ctx.stroke();
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.marginLeft, staffTop);
        this.ctx.lineTo(this.marginLeft, staffTop + (4 * this.staffLineSpacing));
        this.ctx.stroke();
        
        const endX = this.marginLeft + staffWidth;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(endX - 5, staffTop);
        this.ctx.lineTo(endX - 5, staffTop + (4 * this.staffLineSpacing));
        this.ctx.stroke();
        
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, staffTop);
        this.ctx.lineTo(endX, staffTop + (4 * this.staffLineSpacing));
        this.ctx.stroke();
    }
    
    drawBarLines(notes, positions) {
        // Draw bar lines at measure boundaries
        const beatsPerBar = this.timeSignatureNumerator * (4 / this.timeSignatureDenominator);
        const staffTop = this.marginTop;
        const staffHeight = 4 * this.staffLineSpacing;
        
        let cumulativeDuration = 0;
        let lastBarLineX = null;
        
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const durationToAdd = note.dotted ? note.duration * 1.5 : note.duration;
            
            // Check if adding this note would complete or exceed a bar
            const currentBar = Math.floor(cumulativeDuration / beatsPerBar);
            const nextBar = Math.floor((cumulativeDuration + durationToAdd) / beatsPerBar);
            
            if (nextBar > currentBar && i < notes.length - 1) {
                // Draw bar line between this note and the next
                // Position it halfway between the two notes
                const barLineX = i + 1 < notes.length 
                    ? (positions[i] + positions[i + 1]) / 2
                    : positions[i] + this.noteSpacing / 2;
                
                // Don't draw if too close to the last bar line
                if (lastBarLineX === null || barLineX - lastBarLineX > this.noteSpacing / 2) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(barLineX, staffTop);
                    this.ctx.lineTo(barLineX, staffTop + staffHeight);
                    this.ctx.stroke();
                    
                    lastBarLineX = barLineX;
                }
            }
            
            cumulativeDuration += durationToAdd;
        }
    }
    
    drawTrebleClef() {
        this.ctx.font = 'bold 80px serif';
        this.ctx.fillStyle = '#000';
        this.ctx.textBaseline = 'middle';
        
        const clefX = this.marginLeft + 10;
        const clefY = this.marginTop + (2 * this.staffLineSpacing);
        
        this.ctx.fillText(this.symbols.trebleClef, clefX, clefY);
    }
    
    drawTimeSignature(numerator = 4, denominator = 4) {
        // Store time signature for bar calculation
        this.timeSignatureNumerator = numerator;
        this.timeSignatureDenominator = denominator;
        
        this.ctx.font = 'bold 28px serif';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const x = this.marginLeft + 65;
        const topY = this.marginTop + this.staffLineSpacing;
        const bottomY = this.marginTop + (3 * this.staffLineSpacing);
        
        this.ctx.fillText(numerator.toString(), x, topY);
        this.ctx.fillText(denominator.toString(), x, bottomY);
        
        this.ctx.textAlign = 'left';
    }
    
    getNoteHeadY(note) {
        const parsed = this.parseNote(note);
        if (!parsed) return this.marginTop + (2 * this.staffLineSpacing);
        
        const staffPosition = this.pitchToStaffLine[note] || 0;
        const lineY = this.marginTop + (2 * this.staffLineSpacing);
        
        return lineY + (staffPosition * (this.staffLineSpacing / 2));
    }
    
    drawNoteHead(x, y, filled = true) {
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(-0.3); 

        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 7, 5, 0, 0, 2 * Math.PI);
        
        if (filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawDot(x, y) {
        // Draw augmentation dot to the right of the note head
        // The dot is placed in the space if the note is on a line,
        // or on the line if the note is in a space
        this.ctx.fillStyle = '#000';
        
        const dotX = x + 15; // Position to the right of note head
        const staffLineSpacing = this.staffLineSpacing;
        const marginTop = this.marginTop;
        
        // Check if note is on a staff line (y aligns with a line)
        // If on a line, move dot up to the space above
        let dotY = y;
        for (let i = 0; i < this.staffLines; i++) {
            const lineY = marginTop + (i * staffLineSpacing);
            if (Math.abs(y - lineY) < 1) {
                // Note is on a line, move dot up to space
                dotY = y - (staffLineSpacing / 2);
                break;
            }
        }
        
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawWholeRest(x) {
        // Whole rest hangs from the 4th line (second from top)
        const y = this.marginTop + this.staffLineSpacing;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - 6, y, 12, 6);
    }
    
    drawHalfRest(x) {
        // Half rest sits on the 3rd line (middle line)
        const y = this.marginTop + (2 * this.staffLineSpacing);
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - 6, y - 6, 12, 6);
    }
    
    drawQuarterRest(x) {
        // Quarter rest - complex zigzag shape
        const centerY = this.marginTop + (2 * this.staffLineSpacing);
        
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#000';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - 4, centerY - 12);
        this.ctx.quadraticCurveTo(x + 2, centerY - 8, x - 2, centerY - 4);
        this.ctx.quadraticCurveTo(x - 6, centerY, x + 4, centerY + 4);
        this.ctx.lineTo(x + 2, centerY + 8);
        this.ctx.quadraticCurveTo(x - 4, centerY + 10, x - 3, centerY + 14);
        this.ctx.stroke();
        
        // Add blob at bottom
        this.ctx.beginPath();
        this.ctx.arc(x - 3, centerY + 14, 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawEighthRest(x) {
        // Eighth rest - flag-like shape
        const centerY = this.marginTop + (2 * this.staffLineSpacing);
        
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#000';
        this.ctx.lineWidth = 2.5;
        
        // Stem
        this.ctx.beginPath();
        this.ctx.moveTo(x, centerY + 8);
        this.ctx.lineTo(x, centerY - 4);
        this.ctx.stroke();
        
        // Flag
        this.ctx.beginPath();
        this.ctx.arc(x, centerY, 4, 0, Math.PI);
        this.ctx.fill();
        
        // Dot
        this.ctx.beginPath();
        this.ctx.arc(x, centerY + 6, 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawSixteenthRest(x) {
        // Sixteenth rest - two flags
        const centerY = this.marginTop + (2 * this.staffLineSpacing);
        
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#000';
        this.ctx.lineWidth = 2.5;
        
        // Stem
        this.ctx.beginPath();
        this.ctx.moveTo(x, centerY + 12);
        this.ctx.lineTo(x, centerY - 4);
        this.ctx.stroke();
        
        // First flag
        this.ctx.beginPath();
        this.ctx.arc(x, centerY - 2, 4, 0, Math.PI);
        this.ctx.fill();
        
        // First dot
        this.ctx.beginPath();
        this.ctx.arc(x, centerY + 3, 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Second flag
        this.ctx.beginPath();
        this.ctx.arc(x, centerY + 4, 4, 0, Math.PI);
        this.ctx.fill();
        
        // Second dot
        this.ctx.beginPath();
        this.ctx.arc(x, centerY + 9, 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawMultiBarRest(x, measures) {
        // Multi-bar rest - thick horizontal bar with number above
        const centerY = this.marginTop + (2 * this.staffLineSpacing);
        
        // Draw thick horizontal bar
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - 20, centerY - 4, 40, 8);
        
        // Draw vertical lines on ends
        this.ctx.fillRect(x - 20, centerY - 10, 3, 20);
        this.ctx.fillRect(x + 17, centerY - 10, 3, 20);
        
        // Draw number of measures above
        this.ctx.font = 'bold 16px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(measures.toString(), x, centerY - 15);
        this.ctx.textAlign = 'left';
    }
    
    drawRest(x, duration, dotted = false, multiBarCount = null) {
        // Draw rest based on duration
        // If multiBarCount is specified, draw multi-bar rest instead
        
        if (multiBarCount !== null && multiBarCount > 1) {
            this.drawMultiBarRest(x, multiBarCount);
            return;
        }
        
        if (duration >= 4) {
            this.drawWholeRest(x);
        } else if (duration >= 2) {
            this.drawHalfRest(x);
        } else if (duration >= 1) {
            this.drawQuarterRest(x);
        } else if (duration >= 0.5) {
            this.drawEighthRest(x);
        } else if (duration >= 0.25) {
            this.drawSixteenthRest(x);
        } else {
            // Thirty-second rest - similar to sixteenth but with three flags
            this.drawSixteenthRest(x); // Simplified for now
        }
        
        // Draw dot if rest is dotted
        if (dotted) {
            const centerY = this.marginTop + (2 * this.staffLineSpacing);
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(x + 12, centerY, 2.5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    drawStem(x, y, up = true, stemLength = 35) {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        if (up) {
            this.ctx.moveTo(x + 7, y);
            this.ctx.lineTo(x + 7, y - stemLength);
        } else {
            this.ctx.moveTo(x - 7, y);
            this.ctx.lineTo(x - 7, y + stemLength);
        }
        this.ctx.stroke();
        
        return up ? y - stemLength : y + stemLength;
    }
    
    drawFlag(x, y, up = true, count = 1) {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < count; i++) {
            const flagY = y + (i * 8);
            this.ctx.beginPath();
            
            if (up) {
                this.ctx.moveTo(x, flagY);
                this.ctx.bezierCurveTo(
                    x + 15, flagY + 5,
                    x + 15, flagY + 10,
                    x, flagY + 12
                );
            } else {
                this.ctx.moveTo(x, flagY);
                this.ctx.bezierCurveTo(
                    x - 15, flagY - 5,
                    x - 15, flagY - 10,
                    x, flagY - 12
                );
            }
            
            this.ctx.stroke();
        }
    }
    
    drawAccidental(x, y, type) {
        this.ctx.font = 'bold 30px serif';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        let symbol = '';
        if (type === '#') symbol = this.symbols.sharp;
        else if (type === 'b') symbol = this.symbols.flat;
        else if (type === 'n') symbol = this.symbols.natural;
        
        this.ctx.fillText(symbol, x - 20, y);
        this.ctx.textAlign = 'left';
    }
    
    drawLedgerLines(x, y) {
        const staffTop = this.marginTop;
        const staffBottom = this.marginTop + (4 * this.staffLineSpacing);
        
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        
        if (y < staffTop) {
            let ledgerY = staffTop - this.staffLineSpacing;
            while (ledgerY >= y) {
                this.ctx.beginPath();
                this.ctx.moveTo(x - 10, ledgerY);
                this.ctx.lineTo(x + 10, ledgerY);
                this.ctx.stroke();
                ledgerY -= this.staffLineSpacing;
            }
        }
        
        if (y > staffBottom) {
            let ledgerY = staffBottom + this.staffLineSpacing;
            while (ledgerY <= y) {
                this.ctx.beginPath();
                this.ctx.moveTo(x - 10, ledgerY);
                this.ctx.lineTo(x + 10, ledgerY);
                this.ctx.stroke();
                ledgerY += this.staffLineSpacing;
            }
        }
    }
    
    drawArticulation(x, y, articulation, stemUp) {
        // Position articulation on opposite side of stem
        // If stems go up, articulation goes below; if stems go down, articulation goes above
        const articulationY = stemUp ? y + 20 : y - 20;
        
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#000';
        
        switch(articulation.toLowerCase()) {
            case 'staccato':
                // Draw dot
                this.ctx.beginPath();
                this.ctx.arc(x, articulationY, 2.5, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
                
            case 'accent':
                // Draw > symbol (points toward the note)
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                if (stemUp) {
                    // Accent below note, pointing up
                    this.ctx.moveTo(x - 8, articulationY + 3);
                    this.ctx.lineTo(x, articulationY - 3);
                    this.ctx.lineTo(x + 8, articulationY + 3);
                } else {
                    // Accent above note, pointing down
                    this.ctx.moveTo(x - 8, articulationY - 3);
                    this.ctx.lineTo(x, articulationY + 3);
                    this.ctx.lineTo(x + 8, articulationY - 3);
                }
                this.ctx.stroke();
                break;
                
            case 'marcato':
                // Draw ^ wedge symbol (points away from note)
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                if (stemUp) {
                    // Wedge below note, pointing down
                    this.ctx.moveTo(x - 6, articulationY - 4);
                    this.ctx.lineTo(x, articulationY + 4);
                    this.ctx.lineTo(x + 6, articulationY - 4);
                } else {
                    // Wedge above note, pointing up
                    this.ctx.moveTo(x - 6, articulationY + 4);
                    this.ctx.lineTo(x, articulationY - 4);
                    this.ctx.lineTo(x + 6, articulationY + 4);
                }
                this.ctx.stroke();
                break;
                
            case 'tenuto':
                // Draw horizontal line
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x - 8, articulationY);
                this.ctx.lineTo(x + 8, articulationY);
                this.ctx.stroke();
                break;
                
            case 'pizzicato':
            case 'pizz':
            case 'pizz.':
                // Draw text above staff
                this.ctx.font = 'italic 11px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText('pizz.', x, this.marginTop - 5);
                this.ctx.textAlign = 'left';
                break;
                
            case 'arco':
                // Draw text above staff
                this.ctx.font = 'italic 11px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText('arco', x, this.marginTop - 5);
                this.ctx.textAlign = 'left';
                break;
                
            case 'sforzando':
            case 'sfz':
                // Draw text on opposite side of stem
                this.ctx.font = 'bold italic 12px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('sfz', x, articulationY);
                this.ctx.textAlign = 'left';
                break;
                
            case 'tremolo':
                // Tremolo is drawn on the stem, handled in drawTremolo
                break;
        }
    }
    
    drawTremolo(x, y, stemUp, bars = 3) {
        // Draw tremolo slashes on the stem
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2.5;
        
        const stemX = x + (stemUp ? 7 : -7);
        const startY = stemUp ? y - 15 : y + 15;
        
        for (let i = 0; i < bars; i++) {
            const slashY = startY + (stemUp ? -i * 4 : i * 4);
            this.ctx.beginPath();
            this.ctx.moveTo(stemX - 6, slashY);
            this.ctx.lineTo(stemX + 6, slashY - 4);
            this.ctx.stroke();
        }
    }
    
    drawSlur(x1, y1, x2, y2, up = true) {
        // Draw a curved slur connecting two notes (for legato)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        this.ctx.fillStyle = 'transparent';
        
        const midX = (x1 + x2) / 2;
        const distance = Math.abs(x2 - x1);
        const curvature = Math.min(distance / 4, 25);
        
        // Calculate control point for the curve
        // Slur curves away from the note heads
        const avgY = (y1 + y2) / 2;
        const controlY = up ? avgY - curvature : avgY + curvature;
        
        // Start and end points offset from note heads
        const offsetY = up ? -12 : 12;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1 + 8, y1 + offsetY);
        this.ctx.quadraticCurveTo(
            midX, 
            controlY, 
            x2 - 8, 
            y2 + offsetY
        );
        this.ctx.stroke();
    }
    
    getStemDirection(y) {
        // Stem up if note is on or below the middle line (B4)
        const middleLine = this.marginTop + (2 * this.staffLineSpacing);
        return y >= middleLine;
    }
    
    drawNote(x, note, duration, stemUp = null, articulation = null, dotted = false) {
        const y = this.getNoteHeadY(note);
        const parsed = this.parseNote(note);
        
        // Draw ledger lines if needed
        this.drawLedgerLines(x, y);
        
        // Draw accidental if present
        if (parsed && parsed.accidental) {
            this.drawAccidental(x, y, parsed.accidental);
        }
        
        // Determine stem direction if not specified
        if (stemUp === null) {
            stemUp = this.getStemDirection(y);
        }
        
        // Draw note based on duration
        if (duration >= 4) {
            // Whole note (no stem)
            this.drawNoteHead(x, y, false);
        } else if (duration >= 2) {
            // Half note
            this.drawNoteHead(x, y, false);
            this.drawStem(x, y, stemUp);
        } else if (duration >= 1) {
            // Quarter note
            this.drawNoteHead(x, y, true);
            this.drawStem(x, y, stemUp);
        } else if (duration >= 0.5) {
            // Eighth note
            this.drawNoteHead(x, y, true);
            const stemEndY = this.drawStem(x, y, stemUp);
            this.drawFlag(x + (stemUp ? 7 : -7), stemEndY, stemUp, 1);
        } else if (duration >= 0.25) {
            // Sixteenth note
            this.drawNoteHead(x, y, true);
            const stemEndY = this.drawStem(x, y, stemUp);
            this.drawFlag(x + (stemUp ? 7 : -7), stemEndY, stemUp, 2);
        } else {
            // Thirty-second note
            this.drawNoteHead(x, y, true);
            const stemEndY = this.drawStem(x, y, stemUp);
            this.drawFlag(x + (stemUp ? 7 : -7), stemEndY, stemUp, 3);
        }
        
        // Draw dot if note is dotted
        if (dotted) {
            this.drawDot(x, y);
        }
        
        // Draw articulation if present
        if (articulation) {
            if (articulation.toLowerCase() === 'tremolo') {
                this.drawTremolo(x, y, stemUp);
            }
            this.drawArticulation(x, y, articulation, stemUp);
        }
    }
    
    groupNotesForBeaming(notes) {
        // Group consecutive eighth notes and shorter for beaming
        // But DON'T beam across bar lines or more than 4 notes
        const groups = [];
        let currentGroup = [];
        
        // Calculate beats per bar based on time signature
        const beatsPerBar = this.timeSignatureNumerator * (4 / this.timeSignatureDenominator);
        
        // Maximum notes per beam group (typically 4 eighth notes = 1 beat in 4/4 time)
        const maxNotesPerBeam = 4;
        
        // Track cumulative duration to detect bar boundaries
        let cumulativeDuration = 0;
        let lastBarNumber = 0;
        
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const durationToAdd = note.dotted ? note.duration * 1.5 : note.duration;
            
            // Calculate which bar we're in BEFORE adding this note
            const currentBarNumber = Math.floor(cumulativeDuration / beatsPerBar);
            
            // Notes that can be beamed: duration < 1 (eighth notes and shorter) and NOT rests
            if (note.duration < 1 && !note.isRest) {
                // Check if we need to end the current group
                const shouldEndGroup = (
                    // Moved to a new bar
                    (currentBarNumber > lastBarNumber && currentGroup.length >= 2) ||
                    // Reached maximum notes per beam
                    (currentGroup.length >= maxNotesPerBeam)
                );
                
                if (shouldEndGroup) {
                    groups.push(currentGroup);
                    currentGroup = [];
                }
                
                currentGroup.push({ ...note, index: i });
                lastBarNumber = currentBarNumber;
            } else {
                // End current group if we have 2 or more notes
                if (currentGroup.length >= 2) {
                    groups.push(currentGroup);
                }
                currentGroup = [];
                lastBarNumber = currentBarNumber;
            }
            
            // Add duration to cumulative total AFTER processing
            cumulativeDuration += durationToAdd;
        }
        
        // Don't forget the last group
        if (currentGroup.length >= 2) {
            groups.push(currentGroup);
        }
        
        return groups;
    }
    
    drawBeam(x1, y1, x2, y2, beamCount = 1, offset = 0) {
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#000';
        this.ctx.lineWidth = 3;
        
        // Calculate the slope of the beam
        const slope = (y2 - y1) / (x2 - x1);
        
        // Draw multiple beams for sixteenth notes, etc.
        for (let i = 0; i < beamCount; i++) {
            const beamOffset = offset + (i * 5); // 5px spacing between beams
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1 + beamOffset);
            this.ctx.lineTo(x2, y2 + beamOffset);
            this.ctx.stroke();
        }
    }
    
    drawBeamedNotes(beamGroup, positions) {
        if (beamGroup.length < 2) return;
        
        // Get all note head positions
        const notePositions = beamGroup.map(note => ({
            x: positions[note.index],
            y: this.getNoteHeadY(note.note),
            note: note
        }));
        
        // Determine overall stem direction based on average position
        let avgY = 0;
        notePositions.forEach(pos => avgY += pos.y);
        avgY /= notePositions.length;
        const stemUp = this.getStemDirection(avgY);
        
        // Calculate line of best fit for beam slope
        // This makes the beam follow the natural contour of the melody
        const n = notePositions.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        notePositions.forEach(pos => {
            sumX += pos.x;
            sumY += pos.y;
            sumXY += pos.x * pos.y;
            sumX2 += pos.x * pos.x;
        });
        
        // Calculate slope (m) and intercept (b) for y = mx + b
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Limit beam slope to reasonable angles (music notation convention)
        const maxSlope = 0.2; // Maximum slope for readability
        const limitedSlope = Math.max(-maxSlope, Math.min(maxSlope, slope));
        
        // Calculate beam Y position with proper stem length
        const minStemLength = 35;
        
        // Find the extreme note to ensure minimum stem length
        const middleLine = this.marginTop + (2 * this.staffLineSpacing);
        const extremeNote = stemUp 
            ? notePositions.reduce((max, pos) => pos.y > max.y ? pos : max)
            : notePositions.reduce((min, pos) => pos.y < min.y ? pos : min);
        
        // Calculate base beam Y at the extreme note position
        const extremeBeamY = limitedSlope * extremeNote.x + intercept;
        const offset = stemUp 
            ? extremeNote.y - extremeBeamY - minStemLength
            : extremeNote.y - extremeBeamY + minStemLength;
        
        // Adjusted intercept to maintain minimum stem length
        const adjustedIntercept = intercept + offset;
        
        // Draw note heads and calculate stem positions
        const stemData = [];
        notePositions.forEach((pos, idx) => {
            const x = pos.x;
            const y = pos.y;
            const note = pos.note;
            const parsed = this.parseNote(note.note);
            
            // Draw ledger lines if needed
            this.drawLedgerLines(x, y);
            
            // Draw accidental if present
            if (parsed && parsed.accidental) {
                this.drawAccidental(x, y, parsed.accidental);
            }
            
            // Draw note head
            this.drawNoteHead(x, y, true);
            
            // Draw dot if note is dotted
            if (note.dotted) {
                this.drawDot(x, y);
            }
            
            // Calculate stem end point on the sloped beam line
            const stemX = x + (stemUp ? 7 : -7);
            const stemEndY = limitedSlope * x + adjustedIntercept;
            
            // Draw stem to beam line
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            if (stemUp) {
                this.ctx.moveTo(x + 7, y);
                this.ctx.lineTo(x + 7, stemEndY);
            } else {
                this.ctx.moveTo(x - 7, y);
                this.ctx.lineTo(x - 7, stemEndY);
            }
            this.ctx.stroke();
            
            stemData.push({
                x: stemX,
                y: stemEndY,
                noteX: x,
                noteY: y,
                duration: note.duration,
                articulation: note.articulation
            });
            
            // Draw articulation if present
            if (note.articulation) {
                if (note.articulation.toLowerCase() === 'tremolo') {
                    this.drawTremolo(x, y, stemUp);
                }
                this.drawArticulation(x, y, note.articulation, stemUp);
            }
        });
        
        // Draw primary beam across all notes
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(stemData[0].x, stemData[0].y);
        this.ctx.lineTo(stemData[stemData.length - 1].x, stemData[stemData.length - 1].y);
        this.ctx.stroke();
        
        // Draw secondary beams for sixteenth notes and shorter
        for (let i = 0; i < stemData.length; i++) {
            const currentDuration = stemData[i].duration;
            const beamsNeeded = currentDuration <= 0.125 ? 3 : currentDuration <= 0.25 ? 2 : 1;
            
            if (beamsNeeded > 1) {
                // Check if we should connect to next or previous note
                const connectNext = i < stemData.length - 1 && stemData[i + 1].duration <= currentDuration;
                const connectPrev = i > 0 && stemData[i - 1].duration <= currentDuration;
                
                for (let beam = 2; beam <= beamsNeeded; beam++) {
                    const beamOffset = stemUp ? (beam - 1) * 5 : -(beam - 1) * 5;
                    const beamY = stemData[i].y + beamOffset;
                    
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    
                    if (connectNext && stemData[i + 1].duration <= currentDuration) {
                        // Connect to next note
                        const nextBeamY = stemData[i + 1].y + beamOffset;
                        this.ctx.moveTo(stemData[i].x, beamY);
                        this.ctx.lineTo(stemData[i + 1].x, nextBeamY);
                    } else if (connectPrev && stemData[i - 1].duration <= currentDuration) {
                        // Already drawn from previous note
                        continue;
                    } else {
                        // Draw partial beam (flag-like)
                        const beamLength = 15;
                        this.ctx.moveTo(stemData[i].x, beamY);
                        if (i < stemData.length - 1) {
                            this.ctx.lineTo(stemData[i].x + beamLength, beamY);
                        } else {
                            this.ctx.lineTo(stemData[i].x - beamLength, beamY);
                        }
                    }
                    this.ctx.stroke();
                }
            }
        }
    }
    
    render(notesData) {
        // Parse notes data
        const notes = [];
        for (const [key, value] of Object.entries(notesData)) {
            if (Array.isArray(value) && value.length >= 2) {
                const noteValue = value[0];
                const isRest = noteValue.toLowerCase() === 'rest' || noteValue.toLowerCase().startsWith('r');
                const multiBarCount = (isRest && typeof value[4] === 'number') ? value[4] : null;
                
                notes.push({
                    order: parseInt(key),
                    note: noteValue,
                    duration: value[1],
                    articulation: value[2] || null,  // Optional third element for articulation
                    dotted: value[3] || false,  // Optional fourth element for dotted notes
                    isRest: isRest,
                    multiBarCount: multiBarCount  // Optional fifth element for multi-bar rest count
                });
            }
        }
        
        // Sort by order
        notes.sort((a, b) => a.order - b.order);
        
        // Calculate canvas size
        this.calculateCanvasSize(notes.length);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw staff
        this.drawStaff();
        
        // Draw clef
        this.drawTrebleClef();
        
        // Draw time signature
        this.drawTimeSignature();
        
        // Calculate all note positions
        const positions = [];
        let currentX = this.marginLeft + 100;
        notes.forEach(() => {
            positions.push(currentX);
            currentX += this.noteSpacing;
        });
        
        // Group notes for beaming
        const beamGroups = this.groupNotesForBeaming(notes);
        const beamedIndices = new Set();
        
        // Draw beamed note groups
        beamGroups.forEach(group => {
            this.drawBeamedNotes(group, positions);
            group.forEach(note => beamedIndices.add(note.index));
        });
        
        // Draw individual notes (not beamed)
        notes.forEach((noteData, index) => {
            if (!beamedIndices.has(index)) {
                if (noteData.isRest) {
                    this.drawRest(positions[index], noteData.duration, noteData.dotted, noteData.multiBarCount);
                } else {
                    this.drawNote(positions[index], noteData.note, noteData.duration, null, noteData.articulation, noteData.dotted);
                }
            }
        });
        
        // Draw bar lines
        this.drawBarLines(notes, positions);
        
        // Draw legato slurs
        this.drawLegatoSlurs(notes, positions);
        
        // Add subtle shadow to canvas
        this.canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }
    
    drawLegatoSlurs(notes, positions) {
        // Find legato groups and draw slurs
        // Legato can be specified as:
        // - "legato-start" to begin a slur
        // - "legato" to continue a slur
        // - "legato-end" to end a slur
        // Or just consecutive "legato" notes will be grouped together
        
        let legatoGroup = [];
        
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const articulation = note.articulation ? note.articulation.toLowerCase() : '';
            
            const isLegatoStart = articulation === 'legato-start' || articulation === 'legato';
            const isLegatoEnd = articulation === 'legato-end';
            const isLegato = articulation.includes('legato');
            
            if (isLegato) {
                legatoGroup.push(i);
                
                // Draw slur if this is the end or next note is not legato
                const nextNote = notes[i + 1];
                const nextIsLegato = nextNote && nextNote.articulation && 
                                    nextNote.articulation.toLowerCase().includes('legato');
                
                if (isLegatoEnd || !nextIsLegato) {
                    // Draw slur over the entire group
                    if (legatoGroup.length >= 2) {
                        const startIdx = legatoGroup[0];
                        const endIdx = legatoGroup[legatoGroup.length - 1];
                        
                        const x1 = positions[startIdx];
                        const y1 = this.getNoteHeadY(notes[startIdx].note);
                        const x2 = positions[endIdx];
                        const y2 = this.getNoteHeadY(notes[endIdx].note);
                        
                        // Determine if slur should be above or below
                        // Find the highest (lowest y value) note in the group
                        let highestY = Infinity;
                        let lowestY = -Infinity;
                        legatoGroup.forEach(idx => {
                            const noteY = this.getNoteHeadY(notes[idx].note);
                            if (noteY < highestY) highestY = noteY;
                            if (noteY > lowestY) lowestY = noteY;
                        });
                        
                        // Determine average stem direction
                        const middleLine = this.marginTop + (2 * this.staffLineSpacing);
                        const avgY = (highestY + lowestY) / 2;
                        
                        // Slur goes on opposite side of stems
                        // If stems go up, slur goes below; if stems go down, slur goes above
                        const stemsUp = avgY >= middleLine;
                        const slurAbove = !stemsUp;
                        
                        this.drawSlur(x1, y1, x2, y2, slurAbove);
                    }
                    
                    // Reset for next group
                    legatoGroup = [];
                }
            } else {
                // Not legato - reset group
                legatoGroup = [];
            }
        }
    }
}

// Initialize renderer
const renderer = new MusicNotationRenderer('music-canvas');

// Store notes data
let notesData = {};
let noteCounter = 1;

// Parse URL parameters
function parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const jsonParam = urlParams.get('json');
    
    if (jsonParam) {
        try {
            const data = JSON.parse(decodeURIComponent(jsonParam));
            notesData = data;
            
            // Update counter to max key + 1
            const keys = Object.keys(data).map(k => parseInt(k));
            noteCounter = keys.length > 0 ? Math.max(...keys) + 1 : 1;
            
            updateNotesList();
            updateJSON();
            renderer.render(data);
            
            // Get crop parameters
            const cropX = parseInt(urlParams.get('cropX')) || 0;
            const cropY = parseInt(urlParams.get('cropY')) || 0;
            const cropWidth = parseInt(urlParams.get('cropWidth')) || 0;
            const cropHeight = parseInt(urlParams.get('cropHeight')) || 0;
            
            // Hide UI and show only the canvas when loaded from URL
            hideUIShowCanvas(cropX, cropY, cropWidth, cropHeight);
            
            return true; // Successfully loaded from URL
        } catch (error) {
            console.error('Error parsing JSON from URL:', error);
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = `URL JSON Error: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    }
    
    return false; // No JSON in URL
}

// Hide UI and show only canvas
function hideUIShowCanvas(cropX = 0, cropY = 0, cropWidth = 0, cropHeight = 0) {
    // Hide the input section
    const inputSection = document.getElementById('input-section');
    if (inputSection) {
        inputSection.style.display = 'none';
    }
    
    // Hide the title
    const title = document.getElementById('title');
    if (title) {
        title.style.display = 'none';
    }
    
    // Make the canvas container fill the page
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.style.margin = '0';
        canvasContainer.style.padding = '0';
        canvasContainer.style.background = 'transparent';
        canvasContainer.style.borderRadius = '0';
        canvasContainer.style.overflow = 'hidden';
    }
    
    // Make music container transparent and full width
    const musicContainer = document.getElementById('music-container');
    if (musicContainer) {
        musicContainer.style.background = 'transparent';
        musicContainer.style.boxShadow = 'none';
        musicContainer.style.padding = '0';
        musicContainer.style.margin = '0';
        musicContainer.style.maxWidth = '100%';
    }
    
    // Make body background transparent
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Convert canvas to image after a short delay to ensure rendering is complete
    setTimeout(() => {
        convertCanvasToImage(cropX, cropY, cropWidth, cropHeight);
    }, 100);
}

// Convert canvas to img element with optional cropping
function convertCanvasToImage(cropX = 0, cropY = 0, cropWidth = 0, cropHeight = 0) {
    const canvas = document.getElementById('music-canvas');
    const canvasContainer = document.getElementById('canvas-container');
    
    if (canvas && canvasContainer) {
        let imageDataURL;
        
        // If crop parameters are provided, crop the canvas
        if (cropWidth > 0 && cropHeight > 0) {
            // Create a temporary canvas for cropping
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set temp canvas size to crop dimensions
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            
            // Draw the cropped portion
            tempCtx.drawImage(
                canvas,
                cropX, cropY, cropWidth, cropHeight,  // Source rectangle
                0, 0, cropWidth, cropHeight           // Destination rectangle
            );
            
            imageDataURL = tempCanvas.toDataURL('image/png');
        } else {
            // No cropping, use full canvas
            imageDataURL = canvas.toDataURL('image/png');
        }
        
        // Create img element
        const img = document.createElement('img');
        img.src = imageDataURL;
        img.alt = 'Sheet Music Notation';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        // Replace canvas with img
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(img);
    }
}

// Export canvas as image
function exportAsImage() {
    const canvas = document.getElementById('music-canvas');
    const dataURL = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'sheet-music.png';
    link.href = dataURL;
    link.click();
}

// Update notes list display
function updateNotesList() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    
    const entries = Object.entries(notesData).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
    if (entries.length === 0) {
        notesList.innerHTML = '<p style="color: #999; text-align: center;">No notes added yet</p>';
        return;
    }
    
    entries.forEach(([order, noteData]) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        const noteInfo = document.createElement('div');
        noteInfo.className = 'note-info';
        
        const noteNumber = document.createElement('span');
        noteNumber.className = 'note-number';
        noteNumber.textContent = `#${order}`;
        
        const notePitch = document.createElement('span');
        notePitch.className = 'note-pitch';
        const isRest = noteData[0].toLowerCase() === 'rest' || noteData[0].toLowerCase().startsWith('r');
        notePitch.textContent = isRest ? '🎵 Rest' : noteData[0];
        
        const noteDuration = document.createElement('span');
        noteDuration.className = 'note-duration';
        const durationNames = {
            '4': 'Whole',
            '2': 'Half',
            '1': 'Quarter',
            '0.5': 'Eighth',
            '0.25': 'Sixteenth',
            '0.125': 'Thirty-second'
        };
        const durationText = durationNames[noteData[1]] || `Duration: ${noteData[1]}`;
        const dottedText = noteData[3] ? ' (dotted)' : '';
        const multiBarText = noteData[4] ? ` (${noteData[4]} bars)` : '';
        noteDuration.textContent = durationText + dottedText + multiBarText;
        
        const noteArticulation = document.createElement('span');
        noteArticulation.className = 'note-articulation';
        noteArticulation.textContent = noteData[2] ? noteData[2] : '';
        
        noteInfo.appendChild(noteNumber);
        noteInfo.appendChild(notePitch);
        noteInfo.appendChild(noteDuration);
        if (noteData[2]) noteInfo.appendChild(noteArticulation);
        
        const noteActions = document.createElement('div');
        noteActions.className = 'note-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-btn delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.onclick = () => {
            delete notesData[order];
            updateNotesList();
            updateJSON();
        };
        
        noteActions.appendChild(deleteBtn);
        
        noteItem.appendChild(noteInfo);
        noteItem.appendChild(noteActions);
        notesList.appendChild(noteItem);
    });
}

// Update JSON textarea
function updateJSON() {
    document.getElementById('json-input').value = JSON.stringify(notesData, null, 2);
}

// Toggle UI based on note type (note vs rest)
document.getElementById('note-type').addEventListener('change', (e) => {
    const isRest = e.target.value === 'rest';
    document.getElementById('note-pitch-row').style.display = isRest ? 'none' : 'flex';
    document.getElementById('articulation-row').style.display = isRest ? 'none' : 'flex';
    document.getElementById('multi-bar-row').style.display = isRest ? 'flex' : 'none';
});

// Add note button handler
document.getElementById('add-note-btn').addEventListener('click', () => {
    const noteType = document.getElementById('note-type').value;
    const duration = parseFloat(document.getElementById('note-duration').value);
    const dotted = document.getElementById('note-dotted').checked;
    
    let noteValue;
    let articulation = null;
    let multiBarCount = null;
    
    if (noteType === 'rest') {
        noteValue = 'rest';
        const multiBarInput = document.getElementById('multi-bar-count').value;
        if (multiBarInput && parseInt(multiBarInput) > 1) {
            multiBarCount = parseInt(multiBarInput);
        }
    } else {
        const letter = document.getElementById('note-letter').value;
        const accidental = document.getElementById('note-accidental').value;
        const octave = document.getElementById('note-octave').value;
        noteValue = letter + accidental + octave;
        articulation = document.getElementById('note-articulation').value || null;
    }
    
    // Build note data array based on what's specified
    // Format: [pitch/rest, duration, articulation, dotted, multiBarCount]
    const noteData = [noteValue, duration];
    
    if (articulation) {
        noteData.push(articulation);
    } else if (dotted || multiBarCount) {
        noteData.push(null);
    }
    
    if (dotted) {
        noteData.push(true);
    } else if (multiBarCount) {
        noteData.push(false);
    }
    
    if (multiBarCount) {
        noteData.push(multiBarCount);
    }
    
    notesData[noteCounter] = noteData;
    noteCounter++;
    updateNotesList();
    updateJSON();
});

// Clear all button handler
document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all notes?')) {
        notesData = {};
        noteCounter = 1;
        updateNotesList();
        updateJSON();
    }
});

// Update from JSON button handler
document.getElementById('update-from-json-btn').addEventListener('click', () => {
    try {
        const input = document.getElementById('json-input').value;
        const data = JSON.parse(input);
        notesData = data;
        
        // Update counter to max key + 1
        const keys = Object.keys(data).map(k => parseInt(k));
        noteCounter = keys.length > 0 ? Math.max(...keys) + 1 : 1;
        
        updateNotesList();
        
        const errorDiv = document.getElementById('error-message');
        errorDiv.style.display = 'none';
    } catch (error) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = `JSON Error: ${error.message}`;
        errorDiv.style.display = 'block';
    }
});

// Handle render button click
document.getElementById('render-btn').addEventListener('click', () => {
    const errorDiv = document.getElementById('error-message');
    
    try {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        renderer.render(notesData);
    } catch (error) {
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    }
});

// Handle download button click
document.getElementById('download-btn').addEventListener('click', () => {
    exportAsImage();
});

// Handle share URL button click
document.getElementById('share-url-btn').addEventListener('click', () => {
    const jsonString = JSON.stringify(notesData);
    const encodedJSON = encodeURIComponent(jsonString);
    
    // Get current page URL without query parameters
    const baseURL = window.location.origin + window.location.pathname;
    const shareURL = `${baseURL}?json=${encodedJSON}`;
    
    // Show the URL input
    const shareDisplay = document.getElementById('share-url-display');
    const shareInput = document.getElementById('share-url-input');
    shareInput.value = shareURL;
    shareDisplay.style.display = 'block';
    
    // Also show iframe example
    const iframeExample = document.getElementById('iframe-example');
    if (iframeExample) {
        const iframeCode = `<iframe src="${shareURL}" width="800" height="300" frameborder="0" style="border: none;"></iframe>`;
        iframeExample.textContent = iframeCode;
        iframeExample.style.display = 'block';
    }
    
    // Copy to clipboard
    shareInput.select();
    shareInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        navigator.clipboard.writeText(shareURL).then(() => {
            alert('Share URL copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            document.execCommand('copy');
            alert('Share URL copied to clipboard!');
        });
    } catch (err) {
        alert('Please copy the URL manually from the text box below.');
    }
});

// Render example on load
window.addEventListener('load', () => {
    // First, check if JSON is provided via URL parameter
    const loadedFromURL = parseURLParams();
    
    if (!loadedFromURL) {
        // Load default example if no URL parameter
        const exampleData = {
            "1": ["C4", 1, "legato"],
            "2": ["E4", 1, "legato"],
            "3": ["G4", 1, "legato"],
            "4": ["C5", 2, null, true],  // Dotted half note
            "5": ["rest", 0.5],  // Eighth rest
            "6": ["B4", 0.5, "staccato"],
            "7": ["A4", 0.5, "staccato"],
            "8": ["rest", 1],  // Quarter rest
            "9": ["G4", 1, "legato"],
            "10": ["F4", 1, "legato"],
            "11": ["E4", 1, "sforzando"],
            "12": ["rest", 2, null, true],  // Dotted half rest
            "13": ["D4", 1, "tremolo"],
            "14": ["C4", 4]
        };
        
        notesData = exampleData;
        noteCounter = 15;
        updateNotesList();
        updateJSON();
        renderer.render(exampleData);
    }
});
