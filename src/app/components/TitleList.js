// components/TitleList.js

import Link from 'next/link';
import { FaSignOutAlt,  FaTachometerAlt, FaPencilRuler, FaCalendarAlt, FaClipboardList, FaUserGraduate, FaHome, FaCashRegister } from 'react-icons/fa';
import { MdOutlineLibraryBooks } from 'react-icons/md';
import { LiaChalkboardTeacherSolid } from 'react-icons/lia';
import { IoPeopleOutline } from 'react-icons/io5';
import { RiAdminFill } from 'react-icons/ri';
import PropTypes from 'prop-types';

const iconMapping = {
    FaTachometerAlt: FaTachometerAlt,
    FaPencilRuler: FaPencilRuler,
    FaCalendarAlt: FaCalendarAlt,
    FaClipboardList: FaClipboardList,
    FaUserGraduate: FaUserGraduate,
    MdOutlineLibraryBooks: MdOutlineLibraryBooks,
    LiaChalkboardTeacherSolid: LiaChalkboardTeacherSolid,
    IoPeopleOutline: IoPeopleOutline,
    RiAdminFill: RiAdminFill,
    FaHome: FaHome,
    FaCashRegister: FaCashRegister,
  };

const TitleList = ({ titles, onSignOut }) => {
  return (
    <ul className="flex flex-col">
      {titles.length > 0 && titles.map((rw) => {
        const IconComponent = iconMapping[rw.icon] || iconMapping.default; // Use the icon from mapping or fallback
        return (
          <li key={rw.id} className="mb-4 flex flex-col items-center">
            <Link href={rw.link} className="flex flex-col items-center" aria-label={rw.title}>
              <IconComponent className="text-2xl" />
              <div className="text-center font-thin p-2 cursor-pointer w-full capitalize">{rw.title}</div>
            </Link>
          </li>
        );
      })}
      <li className="mb-4 flex flex-col items-center">
        <FaSignOutAlt className="text-2xl" />
        <button
          onClick={onSignOut}
          className="text-center font-thin p-2 rounded cursor-pointer w-full"
          aria-label="Sign Out"
        >
          Sign Out
        </button>
      </li>
    </ul>
  );
};

TitleList.propTypes = {
  titles: PropTypes.array.isRequired,
  onSignOut: PropTypes.func.isRequired,
};

export default TitleList;
