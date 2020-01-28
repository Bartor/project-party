package projectparty

type GetShotsRequest struct {
	response chan []Shot
}

type ShotBank struct {
	deleteShot chan uint64
	moveShots  chan bool
	addShot 	 chan Shot
	getShots   chan GetShotsRequest
}

func NewShotBank() ShotBank {
	return ShotBank{make(chan uint64), make(chan bool), make(chan Shot), make(chan GetShotsRequest)}
}

func (sb *ShotBank) Run() {
	shots := make([]Shot, 0)
	for {
		select {
		case s := <-sb.addShot:
			shots = append(shots, s)
		case <-sb.moveShots:
			for i := range shots {
				shots[i].move()
			}
		case sId := <-sb.deleteShot:
			for i, shot := range shots {
				if shot.id == sId {
					shots[i] = shots[len(shots)-1]
					shots = shots[:len(shots)-1]
					break;
				}
			}
		case req := <-sb.getShots:
			newShots := make([]Shot, len(shots))
			copy(newShots, shots)
			req.response <- newShots
		}
	}

}