import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';

export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<ValueType[]>;
    debounceTimeout?: number;
}

export function DebounceSelect<
    ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 400, value, onFocus, onBlur, onDropdownVisibleChange, ...props }: DebounceSelectProps<ValueType>) {
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(false);
    const [options, setOptions] = useState<ValueType[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const fetchRef = useRef(0);
    const loadOptions = useCallback(async (search: string) => {
        const version = ++fetchRef.current;
        setFetching(true);
        setError(false);
        try {
            const result = await fetchOptions(search);
            if (version === fetchRef.current) setOptions(result);
        } catch {
            if (version === fetchRef.current) {
                setOptions([]);
                setError(true);
            }
        } finally {
            if (version === fetchRef.current) setFetching(false);
        }
    }, [fetchOptions]);
    const debounced = useMemo(() => debounce(loadOptions, debounceTimeout), [loadOptions, debounceTimeout]);
    useEffect(() => () => {
        debounced.cancel();
        fetchRef.current += 1;
    }, [debounced]);

    // Preserve the current selection's label while remote options are being replaced.
    const selected = (Array.isArray(value) ? value : value ? [value] : []) as ValueType[];
    const visibleOptions = searchValue ? options
        : [...selected.filter(item => !options.some(option => option.value === item.value)), ...options];
    return (
        <Select
            {...props}
            labelInValue
            filterOption={false}
            value={value}
            searchValue={searchValue}
            loading={fetching}
            options={visibleOptions}
            onSearch={search => {
                setSearchValue(search);
                fetchRef.current += 1;
                setOptions([]);
                setError(false);
                setFetching(true);
                debounced(search);
            }}
            notFoundContent={fetching ? <Spin size="small" /> : error ? 'Không tải được danh sách. Hãy tìm lại.' : 'Không có kết quả'}
            dropdownRender={menu => <>
                {menu}
                {fetching && <div role="status" style={{ padding: 8 }}><Spin size="small" /> Đang tải công ty...</div>}
                {error && <div role="alert" style={{ padding: 8 }}>
                    Không tải được danh sách công ty.
                    <Button type="link" size="small"
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => { void loadOptions(searchValue); }}>Thử lại</Button>
                </div>}
            </>}
            onDropdownVisibleChange={open => {
                debounced.cancel();
                fetchRef.current += 1;
                setSearchValue('');
                if (open) {
                    // A previous search must not restrict the next opening.
                    setOptions([]);
                    void loadOptions('');
                } else {
                    setFetching(false);
                }
                onDropdownVisibleChange?.(open);
            }}
            onFocus={event => {
                onFocus?.(event);
            }}
            onBlur={event => {
                debounced.cancel();
                fetchRef.current += 1;
                setFetching(false);
                onBlur?.(event);
            }}
        />
    );
}
