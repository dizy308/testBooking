import math
from datetime import datetime


class TimeManage:
    def __init__(self, opening, closing, interval):
        self.opening = opening
        self.closing = closing
        self.interval = interval
        self.non_overlapping = None

    def calculate_block(self, hour_vector):

        start_time = hour_vector[0]
        end_time = hour_vector[1]
        if start_time < self.opening or end_time > self.closing:
            raise ValueError("Invalid Operation Time")

        start_block = math.floor(start_time / self.interval) * self.interval

        block_list = []
        idx = 0
        while start_block < end_time:
            start_temp = max(start_time, start_block)
            end_block = start_block + self.interval
            
            
            end_temp = min(end_block, end_time)

            block_list.append((start_temp, end_temp))
            start_block = end_temp
            idx+=1
            
        return block_list
        
    def startup_block(self):
        return self.calculate_block((self.opening, self.closing))
    
    
    def find_free_slots(self, small_lines):
        small_lines.sort()
        current_position = self.opening
        self.non_overlapping = []

        for start, end in small_lines:
            if start > current_position:
                self.non_overlapping.append((current_position, start))
            current_position = max(current_position, end)
        
        if current_position < self.closing:
            self.non_overlapping.append((current_position, self.closing))
        
        return self.non_overlapping
    
    def uniform_free_slots(self):
        if self.non_overlapping is None:
            raise ValueError("Run find_free_slots first to set non_overlapping!")
        
        uniform_blocks = []
        for slot in self.non_overlapping:
            blocks = self.calculate_block(slot)
            uniform_blocks.extend(blocks)
        
        return uniform_blocks



## --------------------------------------------------------------------------------- ##
def calculate_block_new(start_time, end_time):
    interval=1
    start_block = math.floor(start_time / interval) * interval

    block_list = []
    idx = 0
    while start_block < end_time:
        start_temp = max(start_time, start_block)
        end_block = start_block + interval
        
        
        end_temp = min(end_block, end_time)

        block_list.append((float(start_temp), float(end_temp)))
        start_block = end_temp
        idx+=1
        
    return block_list


def find_free_slots_new(opening_time, closing_time, small_lines):
    small_lines.sort()
    current_position = opening_time
    non_overlapping = []

    for start, end in small_lines:
        if start > current_position:
            non_overlapping.append((current_position, start))
        current_position = max(current_position, end)
    
    if current_position < closing_time:
        non_overlapping.append((current_position, closing_time))
    
    uniform_blocks = []
    for slot in non_overlapping:
        blocks = calculate_block_new(slot[0], slot[1])
        uniform_blocks.extend(blocks)
    return uniform_blocks


