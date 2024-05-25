class Grid 
{
    /**
     * @param {number} size
     */
    constructor(size)
    {
        this.size = size;
        this.grid = [];

        for(let x = 0; x < size; x += 1)
        {
            this.grid[x] = [];

            for(let y = 0; y < size; y += 1)
            {
                this.grid[x][y] = -1;
            }
        }
    }

    set(x, y, value)
    {
        this.grid[x][y] = value;
    }

    get(x, y)
    {
        return this.grid[x][y];
    }

    isComplete()
    {        
        for(let x = 0; x < this.size; x += 1)
        {
            for(let y = 0; y < this.size; y += 1)
            {
                if(this.get(x, y) == -1)
                {
                    return false;   
                }
            }
        }

        return true;
    }

    save()
    {        
        let saveData = "";
        let indexer = 0;

        for(let x = 0; x < this.size; x += 1)
        {
            for(let y = 0; y < this.size; y += 1)
            {
                let value = this.get(x, y);
                saveData += value.toString() + ".";
                indexer++;
            }
        }

        return saveData;
    }

    load(save)
    {
        let values = save.grid.split(".");

        let indexer = 0;

        for(let x = 0; x < this.size; x += 1)
        {
            for(let y = 0; y < this.size; y += 1)
            {
                let value = Number(values[indexer]);

                this.set(x, y, value);
                indexer += 1;
            }
        }
    }

    visualize(visual)
    {
        const color = "#03396c";

        for(let x = 0; x < this.size; x += 1)
        {
            for(let y = 0; y < this.size; y += 1)
            {
                let value = this.get(x, y);

                visual.rect(x - 0.5, y - 0.5, 1, 1, {
                    fill: color,
                    opacity: this.lerp(0, 7, (value / this.size))
                });

                visual.text(value, x, y);
            }
        }
    }

    getPositionsOverThreshold(threshold)
    {
        let positions = [];
        
        for(let x = 0; x < this.size; x += 1)
        {
            for(let y = 0; y < this.size; y += 1)
            {
                let value = this.get(x, y);

                if(value >= threshold)
                {
                    positions.push({
                        pos: {x: x, y: y},
                        value: {value}
                    });
                }
            }
        }

        return positions;
    }

    lerp(a, b, t)
    {
        return a + (b - a) * t
    }
}

module.exports = Grid;