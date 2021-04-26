class DataCube {
  constructor(data, bands_dimension_name, temporal_dimension_name, fromSamples) {
    this.TEMPORAL = "temporal"
    this.BANDS = "bands"
    this.OTHER = "other"
    this.bands_dimension_name = bands_dimension_name;
    this.temporal_dimension_name = temporal_dimension_name;
    this.dimensions = [{name: this.temporal_dimension_name, labels: [], type: this.TEMPORAL}, {name: this.bands_dimension_name, labels: [], type: this.BANDS}]
    if (fromSamples) {
      this.data = this.makeArrayFromSamples(data)
    }
    else {
      this.data = data;
    }
  }

  getDimensionByName(name) {
    return this.dimensions.find(d => d.name === name)
  }

  makeArrayFromSamples(samples) {
    if (Array.isArray(samples)) {
      let newData = []
      for (let entry of samples) {
        if (this.getDimensionByName(this.bands_dimension_name).labels.length === 0) {
          this.getDimensionByName(this.bands_dimension_name).labels = Object.keys(entry)
        }
        newData.push(Object.values(entry))
      }
      return newData
    }
    else {
      if (this.getDimensionByName(this.bands_dimension_name).labels.length === 0) {
          this.getDimensionByName(this.bands_dimension_name).labels = Object.keys(samples)
        }
      return Object.values(samples)
    }
  }

  selectColumn(index) {
    return this.data.map(v => v[index])
  }

  getBandIndices(bands) {
    return bands.map(b => this.getDimensionByName(this.bands_dimension_name).labels.indexOf(b))
  }

  filterBands(bands) {
    const indices = this.getBandIndices(bands)
    for(let i=0; i < this.data.length; i++) {
      this.data[i] = indices.map(ind => this.data[i][ind])
    }
    this.getDimensionByName(this.bands_dimension_name).labels = bands;
  }

  removeDimension(dimension) {
    this.dimensions = this.dimensions.filter(d => d.name !== dimension)
  }

  reduceByDimension(reducer, dimension) {
    console.dir(this.data)
    console.dir(this.dimensions)
    const newData = []

    if (this.dimensions.length === 1) {
      this.data.labels = this.dimensions[0].labels
      this.data = reducer({data: this.data});
      console.dir(this.data)
      console.log("----------------------------------")
      this.removeDimension(dimension)
      return
    }
    if (dimension === this.temporal_dimension_name) {
      console.log("It's temporal")
      for (let i = 0; i < this.data[0].length; i++) {
        const newValue = reducer({data: this.selectColumn(i)})
        newData.push(newValue)
      }
      this.data = newData;
      console.dir(this.data)
      console.log("----------------------------------")
      this.removeDimension(dimension)
    }
    else if (dimension === this.bands_dimension_name) {
      for (let i = 0; i < this.data.length; i++) {
        console.log("It's bands")
        let row = this.data[i]
        row.labels = this.getDimensionByName(this.bands_dimension_name).labels
        const newValue = reducer({data: row})
        this.data[i] = newValue;
      }
      console.dir(this.data)
      console.log("----------------------------------")
      this.removeDimension(dimension)
    }
  }

  addDimensionToData(data) {
    if (!Array.isArray(data)) {
      this.data = [data]
    }
    for (let i = 0; i < data.length; i++) {
      if (Array.isArray(data[i])) {
        this.addDimensionToData(data[i])
      }
      data[i] = [data[i]]
    }
  }

  addDimension(name, label, type) {
    this.addDimensionToData(this.data)
    this.dimensions.push({name: name, labels: [label], type: type})
  }

  clone() {
    const copy = new DataCube(JSON.parse(JSON.stringify(this.data)), this.bands_dimension_name, this.temporal_dimension_name)
    copy.dimensions = JSON.parse(JSON.stringify(this.dimensions))
    return copy
  }
}
