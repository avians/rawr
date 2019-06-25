import { useStoreActions, useStoreState } from "../../redux/store";

import { ImageRequestFilters } from "../../model/Filter";
import { NumberFilter } from "../../component/Filter";
import React from "react";
import { SearchBar } from "../../component/SearchBar";

export const SearchView: React.FC = () => {
    const state = {
        search: useStoreState(store => store.searchModel),
    };
    const actions = {
        search: useStoreActions(actions => actions.searchModel.search),
        addFilter: useStoreActions(
            actions => actions.filterModel.addImageResultFilter
        ),
        removeFilter: useStoreActions(
            actions => actions.filterModel.removeImageResultFilter
        ),
    };

    // get rid of type error on predicate
    const updateFilter = (prev: string, cur: string, predicate: any) => {
        const [prevVal, curVal] = [Number(prev), Number(cur)];

        // Filter has been emptied out, aka do not use a filter
        if (cur.length === 0) {
            actions.removeFilter({
                predicate: predicate(prevVal),
            });
            return;
        }

        actions.removeFilter({
            predicate: predicate(prevVal),
        });
        actions.addFilter({
            predicate: predicate(curVal),
        });
    };

    return (
        <>
            <SearchBar
                disabled={state.search.isLoading}
                onSearchClicked={input => actions.search(input)}
            />
            <NumberFilter
                label={"Score greater than"}
                onValueChanged={(prev, cur) => {
                    updateFilter(
                        prev,
                        cur,
                        ImageRequestFilters.ScoreGreaterThan
                    );
                }}
            />
            <NumberFilter
                label={"Score lower than"}
                onValueChanged={(prev, cur) => {
                    updateFilter(prev, cur, ImageRequestFilters.ScoreLowerThan);
                }}
            />
        </>
    );
};