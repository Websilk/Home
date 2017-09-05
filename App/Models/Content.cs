using System;
using System.Collections.Generic;

namespace Websilk.Models
{
    public enum ContentType
    {
        text = 0,
        number = 1,
        boolean = 2,
        dateTime = 3,
        vendor = 4
    }

    public class ContentInput
    {
        public string name;
        public ContentType type;
        public string vendorType; //vendor-specific type (vendor class namespace as string: "websilk.vendor..." inherits Websilk.Vendors.ContentType)
        public string text;
        public float number;
        public bool boolean;
        public DateTime datetime;
    }

    public class ContentTemplate 
    {
        public string name;
        public DateTime dateCreated;
        public List<ContentInput> inputs;
    }
}
