declare module 'react-flexmonster/hooks' {
    
    export type FlexmonsterReference = {
        readonly flexmonster: () => Flexmonster.Pivot;
    }

    export type PivotComponentProps<TParams = {}> = Partial<Flexmonster.Params> & {
        ref?: React.RefObject<FlexmonsterReference>;
    };    

    export const Pivot: React.FunctionComponent<PivotComponentProps>

}

