import PropTypes from 'prop-types';
import React, { useEffect, useRef, useImperativeHandle } from "react";
import Flexmonster from "flexmonster";

export function Pivot(props, ref) {
	const flexmonsterRef = useRef()

	let flexmonster = null;
	useEffect(() => {
		flexmonster = new Flexmonster({
			...props,
			container: flexmonsterRef.current
		});

		return () => flexmonster.dispose()
	}, [])

	useImperativeHandle(ref, () => ({
		flexmonster: () => {
			return flexmonster;
		}
	}));

	Pivot.propTypes = {
		afterchartdraw: PropTypes.func,
		aftergriddraw: PropTypes.func,
		beforegriddraw: PropTypes.func,
		beforetoolbarcreated: PropTypes.func,
		cellclick: PropTypes.func,
		celldoubleclick: PropTypes.func,
		componentFolder: PropTypes.string,
		customizeCell: PropTypes.func,
		customizeContextMenu: PropTypes.func,
		datachanged: PropTypes.func,
		dataerror: PropTypes.func,
		datafilecancelled: PropTypes.func,
		dataloaded: PropTypes.func,
		fieldslistclose: PropTypes.func,
		fieldslistopen: PropTypes.func,
		filterclose: PropTypes.func,
		filteropen: PropTypes.func,
		fullscreen: PropTypes.func,
		global: PropTypes.object,
		height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		licenseKey: PropTypes.string,
		loadingdata: PropTypes.func,
		loadinglocalization: PropTypes.func,
		loadingolapstructure: PropTypes.func,
		loadingreportfile: PropTypes.func,
		localizationerror: PropTypes.func,
		localizationloaded: PropTypes.func,
		olapstructureerror: PropTypes.func,
		olapstructureloaded: PropTypes.func,
		openingreportfile: PropTypes.func,
		querycomplete: PropTypes.func,
		queryerror: PropTypes.func,
		ready: PropTypes.func,
		report: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		reportchange: PropTypes.func,
		reportcomplete: PropTypes.func,
		reportfilecancelled: PropTypes.func,
		reportfileerror: PropTypes.func,
		reportfileloaded: PropTypes.func,
		runningquery: PropTypes.func,
		toolbar: PropTypes.bool,
		update: PropTypes.func,
		width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}

	return <div ref={flexmonsterRef}>Pivot</div>
}

export default Pivot = React.forwardRef(Pivot);
